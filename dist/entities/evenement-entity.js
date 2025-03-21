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
exports.Evenement = void 0;
const typeorm_1 = require("typeorm");
const seance_entity_1 = require("./seance-entity");
let Evenement = class Evenement {
};
exports.Evenement = Evenement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_evenement' }),
    __metadata("design:type", Number)
], Evenement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Evenement.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Evenement.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Evenement.prototype, "categorie", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Evenement.prototype, "duree", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Evenement.prototype, "prix_standard", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => seance_entity_1.Seance, seance => seance.evenement),
    __metadata("design:type", Array)
], Evenement.prototype, "seances", void 0);
exports.Evenement = Evenement = __decorate([
    (0, typeorm_1.Entity)('evenement')
], Evenement);
//# sourceMappingURL=evenement-entity.js.map