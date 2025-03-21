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
exports.Seance = void 0;
const typeorm_1 = require("typeorm");
const evenement_entity_1 = require("./evenement-entity");
const salle_entity_1 = require("./salle-entity");
const billet_entity_1 = require("./billet-entity");
let Seance = class Seance {
};
exports.Seance = Seance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_seance' }),
    __metadata("design:type", Number)
], Seance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'id_evenement' }),
    __metadata("design:type", Number)
], Seance.prototype, "id_evenement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Seance.prototype, "date_heure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salle_id' }),
    __metadata("design:type", Number)
], Seance.prototype, "salle_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Seance.prototype, "places_disponibles", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => evenement_entity_1.Evenement, evenement => evenement.seances),
    (0, typeorm_1.JoinColumn)({ name: 'id_evenement' }),
    __metadata("design:type", evenement_entity_1.Evenement)
], Seance.prototype, "evenement", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => salle_entity_1.Salle, salle => salle.seances),
    (0, typeorm_1.JoinColumn)({ name: 'salle_id' }),
    __metadata("design:type", salle_entity_1.Salle)
], Seance.prototype, "salle", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => billet_entity_1.Billet, billet => billet.seance),
    __metadata("design:type", Array)
], Seance.prototype, "billets", void 0);
exports.Seance = Seance = __decorate([
    (0, typeorm_1.Entity)('seance')
], Seance);
//# sourceMappingURL=seance-entity.js.map