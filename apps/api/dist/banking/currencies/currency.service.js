"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const ioredis_1 = require("@nestjs-modules/ioredis");
const ioredis_2 = require("ioredis");
const rxjs_1 = require("rxjs");
const currency_rate_entity_1 = require("./currency-rate.entity");
const SUPPORTED = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL'];
const CRYPTO = new Set(['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL']);
let CurrencyService = class CurrencyService {
    rateRepo;
    redis;
    httpService;
    constructor(rateRepo, redis, httpService) {
        this.rateRepo = rateRepo;
        this.redis = redis;
        this.httpService = httpService;
    }
    async getRate(from, to) {
        if (from === to)
            return 1.0;
        if (!SUPPORTED.includes(from))
            throw new common_1.BadRequestException('Unsupported: ' + from);
        if (!SUPPORTED.includes(to))
            throw new common_1.BadRequestException('Unsupported: ' + to);
        const key = 'currency:rate:' + from + ':' + to;
        const cached = await this.redis.get(key);
        if (cached)
            return parseFloat(cached);
        const rate = await this.fetchRate(from, to);
        await this.redis.setex(key, CRYPTO.has(from) || CRYPTO.has(to) ? 60 : 300, rate.toString());
        this.rateRepo.save(this.rateRepo.create({ fromCurr: from, toCurr: to, rate })).catch(() => { });
        return rate;
    }
    async convert(amount, from, to) {
        if (from === to)
            return amount;
        const rate = await this.getRate(from, to);
        return parseFloat((amount * rate).toFixed(8));
    }
    async getHistorical(from, to, limit = 24) {
        return this.rateRepo.find({ where: { fromCurr: from, toCurr: to }, order: { fetchedAt: 'DESC' }, take: limit });
    }
    async fetchRate(from, to) {
        try {
            if (CRYPTO.has(from) || CRYPTO.has(to))
                return await this.fetchCrypto(from, to);
            const url = 'https://open.er-api.com/v6/latest/' + from;
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            if (data && data.rates && data.rates[to]) {
                return parseFloat(data.rates[to].toFixed(8));
            }
            throw new Error('No rate');
        }
        catch (e1) {
            try {
                const url2 = 'https://api.frankfurter.app/latest?from=' + from + '&to=' + to;
                const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url2));
                if (data && data.rates && data.rates[to]) {
                    return parseFloat(data.rates[to].toFixed(8));
                }
            }
            catch (e2) { }
            const last = await this.rateRepo.findOne({ where: { fromCurr: from, toCurr: to }, order: { fetchedAt: 'DESC' } });
            if (last)
                return Number(last.rate);
            throw new common_1.BadRequestException('Cannot fetch rate for ' + from + '/' + to);
        }
    }
    async fetchCrypto(from, to) {
        const idMap = { BTC: 'bitcoin', ETH: 'ethereum', USDT: 'tether', USDC: 'usd-coin', BNB: 'binancecoin', SOL: 'solana' };
        if (CRYPTO.has(from) && !CRYPTO.has(to)) {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get('https://api.coingecko.com/api/v3/simple/price?ids=' + idMap[from] + '&vs_currencies=' + to.toLowerCase()));
            return parseFloat(data[idMap[from]][to.toLowerCase()].toFixed(8));
        }
        if (!CRYPTO.has(from) && CRYPTO.has(to))
            return parseFloat((1 / await this.fetchCrypto(to, from)).toFixed(8));
        return parseFloat(((await this.getRate(from, 'USD')) / (await this.getRate(to, 'USD'))).toFixed(8));
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(currency_rate_entity_1.CurrencyRate)),
    __param(1, (0, ioredis_1.InjectRedis)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ioredis_2.default,
        axios_1.HttpService])
], CurrencyService);
