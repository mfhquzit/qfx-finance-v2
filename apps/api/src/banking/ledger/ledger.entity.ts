import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum EntryType { DEBIT='debit', CREDIT='credit' }
export enum TransactionType { TRANSFER='transfer', DEPOSIT='deposit', WITHDRAWAL='withdrawal', FEE='fee', INVESTMENT='investment' }
export enum TransactionStatus { PENDING='pending', COMPLETED='completed', FAILED='failed', REVERSED='reversed' }

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'account_id' }) accountId: string;
  @Column({ name: 'transaction_id' }) transactionId: string;
  @Column({ name: 'entry_type' }) entryType: EntryType;
  @Column({ type: 'decimal', precision: 20, scale: 8 }) amount: number;
  @Column({ length: 10 }) currency: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'jsonb', default: '{}' }) metadata: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'from_account_id', nullable: true }) fromAccountId: string;
  @Column({ name: 'to_account_id', nullable: true }) toAccountId: string;
  @Column({ type: 'decimal', precision: 20, scale: 8 }) amount: number;
  @Column({ name: 'from_currency', length: 10 }) fromCurrency: string;
  @Column({ name: 'to_currency', length: 10 }) toCurrency: string;
  @Column({ name: 'exchange_rate', type: 'decimal', precision: 20, scale: 8, default: 1.0 }) exchangeRate: number;
  @Column({ name: 'converted_amount', type: 'decimal', precision: 20, scale: 8, nullable: true }) convertedAmount: number;
  @Column({ name: 'transaction_type' }) transactionType: TransactionType;
  @Column({ default: TransactionStatus.PENDING }) status: TransactionStatus;
  @Column({ nullable: true, unique: true }) reference: string;
  @Column({ nullable: true }) description: string;
  @Column({ type: 'jsonb', default: '{}' }) metadata: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @Column({ name: 'completed_at', nullable: true }) completedAt: Date;
}
