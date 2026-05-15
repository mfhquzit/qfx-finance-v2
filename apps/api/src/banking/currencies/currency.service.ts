import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { firstValueFrom } from 'rxjs';
import { CurrencyRate } from './currency-rate.entity';

const SUPPORTED = ['USD','EUR','GBP','JPY','CAD','AUD','CHF','BTC','ETH','USDT','USDC','BNB','SOL'];
const CRYPTO = new Set(['BTC','ETH','USDT','USDC','BNB','SOL']);

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(CurrencyRate) private rateRepo: Repository<CurrencyRate>,
    @InjectRedis() private redis: Redis,
    private httpService: HttpService,
  ) {}

  async getRate(from: string, to: string): Promise<number> {
    if (from === to) return 1.0;
    if (!SUPPORTED.includes(from)) throw new BadRequestException('Unsupported: ' + from);
    if (!SUPPORTED.includes(to)) throw new BadRequestException('Unsupported: ' + to);
    const key = 'currency:rate:' + from + ':' + to;
    const cached = await this.redis.get(key);
    if (cached) return parseFloat(cached);
    const rate = await this.fetchRate(from, to);
    await this.redis.setex(key, CRYPTO.has(from) || CRYPTO.has(to) ? 60 : 300, rate.toString());
    this.rateRepo.save(this.rateRepo.create({ fromCurr: from, toCurr: to, rate })).catch(() => {});
    return rate;
  }

  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;
    const rate = await this.getRate(from, to);
    return parseFloat((amount * rate).toFixed(8));
  }

  async getHistorical(from: string, to: string, limit = 24) {
    return this.rateRepo.find({ where: { fromCurr: from, toCurr: to }, order: { fetchedAt: 'DESC' }, take: limit });
  }

  private async fetchRate(from: string, to: string): Promise<number> {
    try {
      if (CRYPTO.has(from) || CRYPTO.has(to)) return await this.fetchCrypto(from, to);
      const url = 'https://open.er-api.com/v6/latest/' + from;
      const { data } = await firstValueFrom(this.httpService.get(url));
      if (data && data.rates && data.rates[to]) {
        return parseFloat(data.rates[to].toFixed(8));
      }
      throw new Error('No rate');
    } catch (e1) {
      try {
        const url2 = 'https://api.frankfurter.app/latest?from=' + from + '&to=' + to;
        const { data } = await firstValueFrom(this.httpService.get(url2));
        if (data && data.rates && data.rates[to]) {
          return parseFloat(data.rates[to].toFixed(8));
        }
      } catch (e2) {}
      const last = await this.rateRepo.findOne({ where: { fromCurr: from, toCurr: to }, order: { fetchedAt: 'DESC' } });
      if (last) return Number(last.rate);
      throw new BadRequestException('Cannot fetch rate for ' + from + '/' + to);
    }
  }

  private async fetchCrypto(from: string, to: string): Promise<number> {
    const idMap: Record<string,string> = { BTC:'bitcoin', ETH:'ethereum', USDT:'tether', USDC:'usd-coin', BNB:'binancecoin', SOL:'solana' };
    if (CRYPTO.has(from) && !CRYPTO.has(to)) {
      const { data } = await firstValueFrom(this.httpService.get('https://api.coingecko.com/api/v3/simple/price?ids=' + idMap[from] + '&vs_currencies=' + to.toLowerCase()));
      return parseFloat(data[idMap[from]][to.toLowerCase()].toFixed(8));
    }
    if (!CRYPTO.has(from) && CRYPTO.has(to)) return parseFloat((1 / await this.fetchCrypto(to, from)).toFixed(8));
    return parseFloat(((await this.getRate(from,'USD')) / (await this.getRate(to,'USD'))).toFixed(8));
  }
}