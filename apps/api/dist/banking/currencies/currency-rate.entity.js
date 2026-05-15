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
exports.CurrencyRate = void 0;
const typeorm_1 = require("typeorm");
let CurrencyRate = class CurrencyRate {
    id;
    fromCurr;
    toCurr;
    rate;
    source;
    fetchedAt;
};
exports.CurrencyRate = CurrencyRate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CurrencyRate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'from_curr', length: 10 }),
    __metadata("design:type", String)
], CurrencyRate.prototype, "fromCurr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'to_curr', length: 10 }),
    __metadata("design:type", String)
], CurrencyRate.prototype, "toCurr", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8 }),
    __metadata("design:type", Number)
], CurrencyRate.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'exchangerate.host' }),
    __metadata("design:type", String)
], CurrencyRate.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'fetched_at' }),
    __metadata("design:type", Date)
], CurrencyRate.prototype, "fetchedAt", void 0);
exports.CurrencyRate = CurrencyRate = __decorate([
    (0, typeorm_1.Entity)('currency_rates')
], CurrencyRate);
