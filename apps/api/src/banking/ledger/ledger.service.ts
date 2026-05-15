import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { LedgerEntry, EntryType, Transaction, TransactionType, TransactionStatus } from './ledger.entity';
import { BankAccount, AccountStatus } from '../accounts/bank-account.entity';

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @InjectRepository(LedgerEntry) private ledgerRepo: Repository<LedgerEntry>,
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    @InjectRepository(BankAccount) private accountRepo: Repository<BankAccount>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async transfer(fromAccountId: string, toAccountId: string, amount: number, description?: string) {
    if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');
    if (fromAccountId === toAccountId) throw new BadRequestException('Cannot transfer to same account');

    const fromAccount = await this.getActiveAccount(fromAccountId);
    const toAccount = await this.getActiveAccount(toAccountId);
    const balance = await this.getBalance(fromAccountId);

    if (balance < amount) throw new BadRequestException(`Insufficient funds. Available: ${balance}`);

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const transactionId = uuidv4();

      const tx = manager.create(Transaction, {
        id: transactionId,
        fromAccountId,
        toAccountId,
        amount,
        fromCurrency: fromAccount.currency,
        toCurrency: toAccount.currency,
        transactionType: TransactionType.TRANSFER,
        status: TransactionStatus.PENDING,
        description: description ?? 'Transfer',
        reference: `TX-${transactionId.slice(0, 8).toUpperCase()}`,
      });
      await manager.save(Transaction, tx);

      await manager.save(LedgerEntry, {
        accountId: fromAccountId,
        transactionId,
        entryType: EntryType.DEBIT,
        amount,
        currency: fromAccount.currency,
        description: `Transfer to ${toAccount.accountNumber}`,
      });

      await manager.save(LedgerEntry, {
        accountId: toAccountId,
        transactionId,
        entryType: EntryType.CREDIT,
        amount,
        currency: toAccount.currency,
        description: `Transfer from ${fromAccount.accountNumber}`,
      });

      tx.status = TransactionStatus.COMPLETED;
      tx.completedAt = new Date();
      await manager.save(Transaction, tx);

      this.logger.log(`Transfer completed: ${amount} ${fromAccount.currency} [${transactionId}]`);
      return tx;
    });
  }

  async deposit(accountId: string, amount: number, currency: string, description?: string) {
    if (amount <= 0) throw new BadRequestException('Amount must be greater than 0');
    const account = await this.getActiveAccount(accountId);

    return this.dataSource.transaction(async (manager: EntityManager) => {
      const transactionId = uuidv4();

      const tx = manager.create(Transaction, {
        id: transactionId,
        toAccountId: accountId,
        amount,
        fromCurrency: currency,
        toCurrency: account.currency,
        transactionType: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        description: description ?? 'Deposit',
        reference: `DEP-${transactionId.slice(0, 8).toUpperCase()}`,
      });
      await manager.save(Transaction, tx);

      await manager.save(LedgerEntry, {
        accountId,
        transactionId,
        entryType: EntryType.CREDIT,
        amount,
        currency: account.currency,
        description: description ?? 'Deposit',
      });

      tx.status = TransactionStatus.COMPLETED;
      tx.completedAt = new Date();
      await manager.save(Transaction, tx);

      this.logger.log(`Deposit: ${amount} ${currency} → account ${accountId}`);
      return tx;
    });
  }

  async getBalance(accountId: string): Promise<number> {
    const result = await this.dataSource.query(
      `SELECT COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount WHEN entry_type = 'debit' THEN -amount ELSE 0 END), 0) AS balance FROM ledger_entries WHERE account_id = $1`,
      [accountId],
    );
    return parseFloat(result[0]?.balance ?? '0');
  }

  async getAccountWithBalance(accountId: string) {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) throw new NotFoundException('Account not found');
    const balance = await this.getBalance(accountId);
    return { ...account, balance };
  }

  async getStatement(accountId: string, page = 1, limit = 20) {
    await this.getActiveAccount(accountId);
    const [entries, total] = await this.ledgerRepo.findAndCount({
      where: { accountId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const balance = await this.getBalance(accountId);
    return { entries, total, balance, page, limit };
  }

  async getTransactions(accountId: string, page = 1, limit = 20) {
    const [items, total] = await this.transactionRepo.findAndCount({
      where: [{ fromAccountId: accountId }, { toAccountId: accountId }],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  private async getActiveAccount(accountId: string): Promise<BankAccount> {
    const account = await this.accountRepo.findOne({ where: { id: accountId } });
    if (!account) throw new NotFoundException(`Account ${accountId} not found`);
    if (account.status !== AccountStatus.ACTIVE) throw new BadRequestException(`Account is ${account.status}`);
    return account;
  }
}
