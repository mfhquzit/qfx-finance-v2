import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Controller, Get } from '@nestjs/common';
import { BankAccount } from './banking/accounts/bank-account.entity';
import { LedgerEntry, Transaction } from './banking/ledger/ledger.entity';
import { CurrencyRate } from './banking/currencies/currency-rate.entity';
import { BankingModule } from './banking/banking.module';

@Controller()
class AppController {
  @Get('health') health() { return { status: 'ok', timestamp: new Date() }; }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [BankAccount, LedgerEntry, Transaction, CurrencyRate],
        synchronize: false,
        ssl: false,
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'single',
        url: config.get('REDIS_URL', 'redis://redis:6379'),
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    BankingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
