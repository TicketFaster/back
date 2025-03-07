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
exports.HistoriqueReservation = void 0;
const typeorm_1 = require("typeorm");
let HistoriqueReservation = class HistoriqueReservation {
};
exports.HistoriqueReservation = HistoriqueReservation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_historique' }),
    __metadata("design:type", Number)
], HistoriqueReservation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_reservation' }),
    __metadata("design:type", Number)
], HistoriqueReservation.prototype, "id_reservation", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, name: 'ancien_statut' }),
    __metadata("design:type", String)
], HistoriqueReservation.prototype, "ancien_statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, name: 'nouveau_statut' }),
    __metadata("design:type", String)
], HistoriqueReservation.prototype, "nouveau_statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'date_modification' }),
    __metadata("design:type", Date)
], HistoriqueReservation.prototype, "date_modification", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], HistoriqueReservation.prototype, "utilisateur", void 0);
exports.HistoriqueReservation = HistoriqueReservation = __decorate([
    (0, typeorm_1.Entity)('historique_reservation')
], HistoriqueReservation);
//# sourceMappingURL=historique-reservation-entity.js.map