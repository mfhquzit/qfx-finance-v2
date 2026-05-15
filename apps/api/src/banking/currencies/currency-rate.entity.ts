import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('currency_rates')
export class CurrencyRate {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'from_curr', length: 10 }) fromCurr: string;
  @Column({ name: 'to_curr', length: 10 }) toCurr: string;
  @Column({ type: 'decimal', precision: 20, scale: 8 }) rate: number;
  @Column({ default: 'exchangerate.host' }) source: string;
  @CreateDateColumn({ name: 'fetched_at' }) fetchedAt: Date;
}
