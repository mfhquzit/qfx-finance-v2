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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const ioredis_1 = require("@nestjs-modules/ioredis");
const common_2 = require("@nestjs/common");
const bank_account_entity_1 = require("./banking/accounts/bank-account.entity");
const ledger_entity_1 = require("./banking/ledger/ledger.entity");
const currency_rate_entity_1 = require("./banking/currencies/currency-rate.entity");
const banking_module_1 = require("./banking/banking.module");
let AppController = class AppController {
    health() { return { status: 'ok', timestamp: new Date() }; }
};
__decorate([
    (0, common_2.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "health", null);
AppController = __decorate([
    (0, common_2.Controller)()
], AppController);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    type: 'postgres',
                    url: config.get('DATABASE_URL'),
                    entities: [bank_account_entity_1.BankAccount, ledger_entity_1.LedgerEntry, ledger_entity_1.Transaction, currency_rate_entity_1.CurrencyRate],
                    synchronize: false,
                    ssl: false,
                }),
                inject: [config_1.ConfigService],
            }),
            ioredis_1.RedisModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    type: 'single',
                    url: config.get('REDIS_URL', 'redis://redis:6379'),
                }),
                inject: [config_1.ConfigService],
            }),
            axios_1.HttpModule,
            banking_module_1.BankingModule,
        ],
        controllers: [AppController],
    })
], AppModule);
