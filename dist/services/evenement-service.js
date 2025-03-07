"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvenementService = void 0;
const evenement_entity_1 = require("../entities/evenement-entity");
const database_1 = require("../utils/database");
const logger_utility_1 = require("../utils/logger-utility");
class EvenementService {
    constructor() {
        this.evenementRepository = database_1.AppDataSource.getRepository(evenement_entity_1.Evenement);
    }
    async findAll() {
        try {
            return await this.evenementRepository.find();
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la récupération des événements', error);
            throw error;
        }
    }
    async findOne(id) {
        try {
            return await this.evenementRepository.findOneBy({ id });
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération de l'événement ${id}`, error);
            throw error;
        }
    }
    async create(evenementData) {
        try {
            const evenement = this.evenementRepository.create(evenementData);
            return await this.evenementRepository.save(evenement);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la création d\'un événement', error);
            throw error;
        }
    }
    async update(id, evenementData) {
        try {
            await this.evenementRepository.update(id, evenementData);
            return await this.evenementRepository.findOneBy({ id });
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la mise à jour de l'événement ${id}`, error);
            throw error;
        }
    }
    async delete(id) {
        try {
            await this.evenementRepository.delete(id);
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la suppression de l'événement ${id}`, error);
            throw error;
        }
    }
}
exports.EvenementService = EvenementService;
//# sourceMappingURL=evenement-service.js.map