import { Controller, Post, Get, Body, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { LedgerService } from './ledger/ledger.service';
import { CurrencyService } from './currencies/currency.service';

@Controller('banking')
export class BankingController {
  constructor(
    private ledgerService: LedgerService,
    private currencyService: CurrencyService,
  ) {}

  @Post('transfer')
  transfer(@Body() body: { fromAccountId: string; toAccountId: string; amount: number; description?: string }) {
    return this.ledgerService.transfer(body.fromAccountId, body.toAccountId, body.amount, body.description);
  }

  @Post('deposit')
  deposit(@Body() body: { accountId: string; amount: number; currency: string; description?: string }) {
    return this.ledgerService.deposit(body.accountId, body.amount, body.currency, body.description);
  }

  @Get('balance/:accountId')
  async getBalance(@Param('accountId') accountId: string) {
    const balance = await this.ledgerService.getBalance(accountId);
    return { accountId, balance };
  }

  @Get('account/:accountId')
  getAccount(@Param('accountId') accountId: string) {
    return this.ledgerService.getAccountWithBalance(accountId);
  }

  @Get('statement/:accountId')
  getStatement(
    @Param('accountId') accountId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.ledgerService.getStatement(accountId, page, limit);
  }

  @Get('transactions/:accountId')
  getTransactions(
    @Param('accountId') accountId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.ledgerService.getTransactions(accountId, page, limit);
  }

  @Get('rate')
  getRate(@Query('from') from: string, @Query('to') to: string) {
    return this.currencyService.getRate(from.toUpperCase(), to.toUpperCase())
      .then(rate => ({ from, to, rate, timestamp: new Date() }));
  }

  @Get('convert')
  convert(@Query('from') from: string, @Query('to') to: string, @Query('amount') amount: string) {
    return this.currencyService.convert(parseFloat(amount), from.toUpperCase(), to.toUpperCase())
      .then(result => ({ from, to, original: parseFloat(amount), converted: result, timestamp: new Date() }));
  }
}
