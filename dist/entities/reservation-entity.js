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
exports.Reservation = void 0;
const typeorm_1 = require("typeorm");
const client_entity_1 = require("./client-entity");
const billet_entity_1 = require("./billet-entity");
let Reservation = class Reservation {
};
exports.Reservation = Reservation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_reservation' }),
    __metadata("design:type", Number)
], Reservation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_client' }),
    __metadata("design:type", Number)
], Reservation.prototype, "id_client", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Reservation.prototype, "date_reservation", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Reservation.prototype, "statut_paiement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Reservation.prototype, "montant_total", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client, client => client.reservations),
    (0, typeorm_1.JoinColumn)({ name: 'id_client' }),
    __metadata("design:type", client_entity_1.Client)
], Reservation.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => billet_entity_1.Billet, billet => billet.reservation),
    __metadata("design:type", Array)
], Reservation.prototype, "billets", void 0);
exports.Reservation = Reservation = __decorate([
    (0, typeorm_1.Entity)('reservation')
], Reservation);
//# sourceMappingURL=reservation-entity.js.map