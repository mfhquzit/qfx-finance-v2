"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const bank_account_entity_1 = require("./accounts/bank-account.entity");
const ledger_entity_1 = require("./ledger/ledger.entity");
const currency_rate_entity_1 = require("./currencies/currency-rate.entity");
const ledger_service_1 = require("./ledger/ledger.service");
const currency_service_1 = require("./currencies/currency.service");
const banking_controller_1 = require("./banking.controller");
let BankingModule = class BankingModule {
};
exports.BankingModule = BankingModule;
exports.BankingModule = BankingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            typeorm_1.TypeOrmModule.forFeature([bank_account_entity_1.BankAccount, ledger_entity_1.LedgerEntry, ledger_entity_1.Transaction, currency_rate_entity_1.CurrencyRate]),
        ],
        controllers: [banking_controller_1.BankingController],
        providers: [ledger_service_1.LedgerService, currency_service_1.CurrencyService],
        exports: [ledger_service_1.LedgerService, currency_service_1.CurrencyService],
    })
], BankingModule);
