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
exports.Billet = void 0;
const typeorm_1 = require("typeorm");
const reservation_entity_1 = require("./reservation-entity");
const seance_entity_1 = require("./seance-entity");
let Billet = class Billet {
};
exports.Billet = Billet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_billet' }),
    __metadata("design:type", Number)
], Billet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_reservation' }),
    __metadata("design:type", Number)
], Billet.prototype, "id_reservation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_seance' }),
    __metadata("design:type", Number)
], Billet.prototype, "id_seance", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Billet.prototype, "type_tarif", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Billet.prototype, "prix_final", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Billet.prototype, "code_barre", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Billet.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reservation_entity_1.Reservation, reservation => reservation.billets),
    (0, typeorm_1.JoinColumn)({ name: 'id_reservation' }),
    __metadata("design:type", reservation_entity_1.Reservation)
], Billet.prototype, "reservation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => seance_entity_1.Seance, seance => seance.billets),
    (0, typeorm_1.JoinColumn)({ name: 'id_seance' }),
    __metadata("design:type", seance_entity_1.Seance)
], Billet.prototype, "seance", void 0);
exports.Billet = Billet = __decorate([
    (0, typeorm_1.Entity)('billet')
], Billet);
//# sourceMappingURL=billet-entity.js.map