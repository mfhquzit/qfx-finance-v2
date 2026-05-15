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
var LedgerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const ledger_entity_1 = require("./ledger.entity");
const bank_account_entity_1 = require("../accounts/bank-account.entity");
let LedgerService = LedgerService_1 = class LedgerService {
    ledgerRepo;
    transactionRepo;
    accountRepo;
    dataSource;
    logger = new common_1.Logger(LedgerService_1.name);
    constructor(ledgerRepo, transactionRepo, accountRepo, dataSource) {
        this.ledgerRepo = ledgerRepo;
        this.transactionRepo = transactionRepo;
        this.accountRepo = accountRepo;
        this.dataSource = dataSource;
    }
    async transfer(fromAccountId, toAccountId, amount, description) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be greater than 0');
        if (fromAccountId === toAccountId)
            throw new common_1.BadRequestException('Cannot transfer to same account');
        const fromAccount = await this.getActiveAccount(fromAccountId);
        const toAccount = await this.getActiveAccount(toAccountId);
        const balance = await this.getBalance(fromAccountId);
        if (balance < amount)
            throw new common_1.BadRequestException(`Insufficient funds. Available: ${balance}`);
        return this.dataSource.transaction(async (manager) => {
            const transactionId = (0, uuid_1.v4)();
            const tx = manager.create(ledger_entity_1.Transaction, {
                id: transactionId,
                fromAccountId,
                toAccountId,
                amount,
                fromCurrency: fromAccount.currency,
                toCurrency: toAccount.currency,
                transactionType: ledger_entity_1.TransactionType.TRANSFER,
                status: ledger_entity_1.TransactionStatus.PENDING,
                description: description ?? 'Transfer',
                reference: `TX-${transactionId.slice(0, 8).toUpperCase()}`,
            });
            await manager.save(ledger_entity_1.Transaction, tx);
            await manager.save(ledger_entity_1.LedgerEntry, {
                accountId: fromAccountId,
                transactionId,
                entryType: ledger_entity_1.EntryType.DEBIT,
                amount,
                currency: fromAccount.currency,
                description: `Transfer to ${toAccount.accountNumber}`,
            });
            await manager.save(ledger_entity_1.LedgerEntry, {
                accountId: toAccountId,
                transactionId,
                entryType: ledger_entity_1.EntryType.CREDIT,
                amount,
                currency: toAccount.currency,
                description: `Transfer from ${fromAccount.accountNumber}`,
            });
            tx.status = ledger_entity_1.TransactionStatus.COMPLETED;
            tx.completedAt = new Date();
            await manager.save(ledger_entity_1.Transaction, tx);
            this.logger.log(`Transfer completed: ${amount} ${fromAccount.currency} [${transactionId}]`);
            return tx;
        });
    }
    async deposit(accountId, amount, currency, description) {
        if (amount <= 0)
            throw new common_1.BadRequestException('Amount must be greater than 0');
        const account = await this.getActiveAccount(accountId);
        return this.dataSource.transaction(async (manager) => {
            const transactionId = (0, uuid_1.v4)();
            const tx = manager.create(ledger_entity_1.Transaction, {
                id: transactionId,
                toAccountId: accountId,
                amount,
                fromCurrency: currency,
                toCurrency: account.currency,
                transactionType: ledger_entity_1.TransactionType.DEPOSIT,
                status: ledger_entity_1.TransactionStatus.PENDING,
                description: description ?? 'Deposit',
                reference: `DEP-${transactionId.slice(0, 8).toUpperCase()}`,
            });
            await manager.save(ledger_entity_1.Transaction, tx);
            await manager.save(ledger_entity_1.LedgerEntry, {
                accountId,
                transactionId,
                entryType: ledger_entity_1.EntryType.CREDIT,
                amount,
                currency: account.currency,
                description: description ?? 'Deposit',
            });
            tx.status = ledger_entity_1.TransactionStatus.COMPLETED;
            tx.completedAt = new Date();
            await manager.save(ledger_entity_1.Transaction, tx);
            this.logger.log(`Deposit: ${amount} ${currency} → account ${accountId}`);
            return tx;
        });
    }
    async getBalance(accountId) {
        const result = await this.dataSource.query(`SELECT COALESCE(SUM(CASE WHEN entry_type = 'credit' THEN amount WHEN entry_type = 'debit' THEN -amount ELSE 0 END), 0) AS balance FROM ledger_entries WHERE account_id = $1`, [accountId]);
        return parseFloat(result[0]?.balance ?? '0');
    }
    async getAccountWithBalance(accountId) {
        const account = await this.accountRepo.findOne({ where: { id: accountId } });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        const balance = await this.getBalance(accountId);
        return { ...account, balance };
    }
    async getStatement(accountId, page = 1, limit = 20) {
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
    async getTransactions(accountId, page = 1, limit = 20) {
        const [items, total] = await this.transactionRepo.findAndCount({
            where: [{ fromAccountId: accountId }, { toAccountId: accountId }],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, page, limit };
    }
    async getActiveAccount(accountId) {
        const account = await this.accountRepo.findOne({ where: { id: accountId } });
        if (!account)
            throw new common_1.NotFoundException(`Account ${accountId} not found`);
        if (account.status !== bank_account_entity_1.AccountStatus.ACTIVE)
            throw new common_1.BadRequestException(`Account is ${account.status}`);
        return account;
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = LedgerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ledger_entity_1.LedgerEntry)),
    __param(1, (0, typeorm_1.InjectRepository)(ledger_entity_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], LedgerService);
