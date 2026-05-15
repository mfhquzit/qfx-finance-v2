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
exports.BankingController = void 0;
const common_1 = require("@nestjs/common");
const ledger_service_1 = require("./ledger/ledger.service");
const currency_service_1 = require("./currencies/currency.service");
let BankingController = class BankingController {
    ledgerService;
    currencyService;
    constructor(ledgerService, currencyService) {
        this.ledgerService = ledgerService;
        this.currencyService = currencyService;
    }
    transfer(body) {
        return this.ledgerService.transfer(body.fromAccountId, body.toAccountId, body.amount, body.description);
    }
    deposit(body) {
        return this.ledgerService.deposit(body.accountId, body.amount, body.currency, body.description);
    }
    async getBalance(accountId) {
        const balance = await this.ledgerService.getBalance(accountId);
        return { accountId, balance };
    }
    getAccount(accountId) {
        return this.ledgerService.getAccountWithBalance(accountId);
    }
    getStatement(accountId, page, limit) {
        return this.ledgerService.getStatement(accountId, page, limit);
    }
    getTransactions(accountId, page, limit) {
        return this.ledgerService.getTransactions(accountId, page, limit);
    }
    getRate(from, to) {
        return this.currencyService.getRate(from.toUpperCase(), to.toUpperCase())
            .then(rate => ({ from, to, rate, timestamp: new Date() }));
    }
    convert(from, to, amount) {
        return this.currencyService.convert(parseFloat(amount), from.toUpperCase(), to.toUpperCase())
            .then(result => ({ from, to, original: parseFloat(amount), converted: result, timestamp: new Date() }));
    }
};
exports.BankingController = BankingController;
__decorate([
    (0, common_1.Post)('transfer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BankingController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)('deposit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BankingController.prototype, "deposit", null);
__decorate([
    (0, common_1.Get)('balance/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankingController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('account/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BankingController.prototype, "getAccount", null);
__decorate([
    (0, common_1.Get)('statement/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], BankingController.prototype, "getStatement", null);
__decorate([
    (0, common_1.Get)('transactions/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], BankingController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('rate'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BankingController.prototype, "getRate", null);
__decorate([
    (0, common_1.Get)('convert'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BankingController.prototype, "convert", null);
exports.BankingController = BankingController = __decorate([
    (0, common_1.Controller)('banking'),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService,
        currency_service_1.CurrencyService])
], BankingController);
