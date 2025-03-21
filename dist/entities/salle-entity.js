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
exports.Salle = void 0;
const typeorm_1 = require("typeorm");
const seance_entity_1 = require("./seance-entity");
let Salle = class Salle {
};
exports.Salle = Salle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'id_salle' }),
    __metadata("design:type", Number)
], Salle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Salle.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Salle.prototype, "capacite", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Salle.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => seance_entity_1.Seance, seance => seance.salle),
    __metadata("design:type", Array)
], Salle.prototype, "seances", void 0);
exports.Salle = Salle = __decorate([
    (0, typeorm_1.Entity)('salle')
], Salle);
//# sourceMappingURL=salle-entity.js.map