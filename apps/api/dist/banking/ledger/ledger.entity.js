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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.LedgerEntry = exports.TransactionStatus = exports.TransactionType = exports.EntryType = void 0;
const typeorm_1 = require("typeorm");
var EntryType;
(function (EntryType) {
    EntryType["DEBIT"] = "debit";
    EntryType["CREDIT"] = "credit";
})(EntryType || (exports.EntryType = EntryType = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["TRANSFER"] = "transfer";
    TransactionType["DEPOSIT"] = "deposit";
    TransactionType["WITHDRAWAL"] = "withdrawal";
    TransactionType["FEE"] = "fee";
    TransactionType["INVESTMENT"] = "investment";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["REVERSED"] = "reversed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let LedgerEntry = class LedgerEntry {
    id;
    accountId;
    transactionId;
    entryType;
    amount;
    currency;
    description;
    metadata;
    createdAt;
};
exports.LedgerEntry = LedgerEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LedgerEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_id' }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_id' }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entry_type' }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "entryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", Number)
], LedgerEntry.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10 }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LedgerEntry.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], LedgerEntry.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LedgerEntry.prototype, "createdAt", void 0);
exports.LedgerEntry = LedgerEntry = __decorate([
    (0, typeorm_1.Entity)('ledger_entries')
], LedgerEntry);
let Transaction = class Transaction {
    id;
    fromAccountId;
    toAccountId;
    amount;
    fromCurrency;
    toCurrency;
    exchangeRate;
    convertedAmount;
    transactionType;
    status;
    reference;
    description;
    metadata;
    createdAt;
    completedAt;
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_account_id', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "fromAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_account_id', nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "toAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_currency', length: 10 }),
    __metadata("design:type", String)
], Transaction.prototype, "fromCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_currency', length: 10 }),
    __metadata("design:type", String)
], Transaction.prototype, "toCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exchange_rate', type: 'decimal', precision: 20, scale: 8, default: 1.0 }),
    __metadata("design:type", Number)
], Transaction.prototype, "exchangeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'converted_amount', type: 'decimal', precision: 20, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "convertedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_type' }),
    __metadata("design:type", String)
], Transaction.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: TransactionStatus.PENDING }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Transaction.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], Transaction.prototype, "completedAt", void 0);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions')
], Transaction);
