import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BankAccount } from './accounts/bank-account.entity';
import { LedgerEntry, Transaction } from './ledger/ledger.entity';
import { CurrencyRate } from './currencies/currency-rate.entity';
import { LedgerService } from './ledger/ledger.service';
import { CurrencyService } from './currencies/currency.service';
import { BankingController } from './banking.controller';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([BankAccount, LedgerEntry, Transaction, CurrencyRate]),
  ],
  controllers: [BankingController],
  providers: [LedgerService, CurrencyService],
  exports: [LedgerService, CurrencyService],
})
export class BankingModule {}
