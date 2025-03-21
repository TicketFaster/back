"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../utils/database");
const user_entity_1 = require("../entities/user-entity");
const logger_utility_1 = require("../utils/logger-utility");
class UserService {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(user_entity_1.User);
    }
    /**
     * Récupère tous les utilisateurs
     */
    async findAll() {
        try {
            return await this.userRepository.find();
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la récupération des utilisateurs', error);
            throw error;
        }
    }
    /**
     * Récupère un utilisateur par son ID
     */
    async findById(id) {
        try {
            return await this.userRepository.findOneBy({ id });
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération de l'utilisateur ${id}`, error);
            throw error;
        }
    }
    /**
     * Récupère un utilisateur par son nom d'utilisateur
     */
    async findByUsername(username) {
        try {
            return await this.userRepository.findOneBy({ username });
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération de l'utilisateur ${username}`, error);
            throw error;
        }
    }
    /**
     * Crée un nouvel utilisateur
     */
    async create(userData) {
        try {
            // Vérifiez que tous les champs requis sont présents
            if (!userData.username || !userData.password || !userData.email || !userData.fullname) {
                throw new Error("Données utilisateur incomplètes");
            }
            // Hasher le mot de passe
            if (userData.password) {
                const salt = await bcryptjs_1.default.genSalt(10);
                userData.password = await bcryptjs_1.default.hash(userData.password, salt);
            }
            const user = this.userRepository.create(userData);
            return await this.userRepository.save(user);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la création d\'un utilisateur', error);
            throw error;
        }
    }
    /**
     * Met à jour un utilisateur existant
     */
    async update(id, userData) {
        try {
            // Hasher le mot de passe si fourni
            if (userData.password) {
                const salt = await bcryptjs_1.default.genSalt(10);
                userData.password = await bcryptjs_1.default.hash(userData.password, salt);
            }
            await this.userRepository.update(id, userData);
            return await this.userRepository.findOneBy({ id });
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la mise à jour de l'utilisateur ${id}`, error);
            throw error;
        }
    }
    /**
     * Supprime un utilisateur
     */
    async delete(id) {
        try {
            await this.userRepository.delete(id);
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la suppression de l'utilisateur ${id}`, error);
            throw error;
        }
    }
    /**
     * Vérifie si un utilisateur existe par son nom d'utilisateur
     */
    async usernameExists(username) {
        try {
            const count = await this.userRepository.countBy({ username });
            return count > 0;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la vérification de l'existence de l'utilisateur ${username}`, error);
            throw error;
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user-service.js.map