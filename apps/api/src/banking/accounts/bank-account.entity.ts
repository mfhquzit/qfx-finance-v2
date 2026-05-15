import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AccountType { CHECKING='checking', SAVINGS='savings', INVESTMENT='investment', CRYPTO='crypto' }
export enum AccountStatus { ACTIVE='active', FROZEN='frozen', CLOSED='closed' }

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id' }) userId: string;
  @Column({ length: 10, default: 'USD' }) currency: string;
  @Column({ name: 'account_type', default: AccountType.CHECKING }) accountType: AccountType;
  @Column({ name: 'account_number', unique: true }) accountNumber: string;
  @Column({ nullable: true }) iban: string;
  @Column({ default: AccountStatus.ACTIVE }) status: AccountStatus;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
