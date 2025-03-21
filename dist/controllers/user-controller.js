"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user-service");
const logger_utility_1 = require("../utils/logger-utility");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    /**
     * Récupère tous les utilisateurs
     */
    async getAllUsers(req, res) {
        try {
            const users = await this.userService.findAll();
            // Supprimer les mots de passe des résultats
            const usersWithoutPasswords = users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
            res.status(200).json(usersWithoutPasswords);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la récupération des utilisateurs', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
        }
    }
    /**
     * Récupère un utilisateur par son ID
     */
    async getUserById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const user = await this.userService.findById(id);
            if (user) {
                // Supprimer le mot de passe du résultat
                const { password, ...userWithoutPassword } = user;
                res.status(200).json(userWithoutPassword);
            }
            else {
                res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération de l'utilisateur ${req.params.id}`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
        }
    }
    /**
     * Crée un nouvel utilisateur
     */
    async createUser(req, res) {
        try {
            const userData = req.body;
            // Validation de base
            if (!userData.username || !userData.password || !userData.email) {
                res.status(400).json({ message: 'Données utilisateur incomplètes' });
                return;
            }
            // Vérifier si l'utilisateur existe déjà
            const exists = await this.userService.usernameExists(userData.username);
            if (exists) {
                res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
                return;
            }
            const newUser = await this.userService.create(userData);
            // Supprimer le mot de passe du résultat
            const { password, ...userWithoutPassword } = newUser;
            res.status(201).json(userWithoutPassword);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la création d\'un utilisateur', error);
            res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
        }
    }
    /**
     * Met à jour un utilisateur existant
     */
    async updateUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            const userData = req.body;
            // Vérifier que l'utilisateur existe
            const existingUser = await this.userService.findById(id);
            if (!existingUser) {
                res.status(404).json({ message: 'Utilisateur non trouvé' });
                return;
            }
            // Si le nom d'utilisateur est modifié, vérifier qu'il n'existe pas déjà
            if (userData.username && userData.username !== existingUser.username) {
                const exists = await this.userService.usernameExists(userData.username);
                if (exists) {
                    res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
                    return;
                }
            }
            const updatedUser = await this.userService.update(id, userData);
            if (updatedUser) {
                // Supprimer le mot de passe du résultat
                const { password, ...userWithoutPassword } = updatedUser;
                res.status(200).json(userWithoutPassword);
            }
            else {
                res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la mise à jour de l'utilisateur ${req.params.id}`, error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
        }
    }
    /**
     * Change le mot de passe d'un utilisateur
     */
    async changePassword(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe requis' });
                return;
            }
            // Vérifier que l'utilisateur existe
            const user = await this.userService.findById(id);
            if (!user) {
                res.status(404).json({ message: 'Utilisateur non trouvé' });
                return;
            }
            // Vérifier le mot de passe actuel
            const bcrypt = require('bcryptjs');
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                res.status(401).json({ message: 'Mot de passe actuel incorrect' });
                return;
            }
            // Mettre à jour le mot de passe
            await this.userService.update(id, { password: newPassword });
            res.status(200).json({ message: 'Mot de passe modifié avec succès' });
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors du changement de mot de passe pour l'utilisateur ${req.params.id}`, error);
            res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
        }
    }
    /**
     * Supprime un utilisateur
     */
    async deleteUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            // Vérifier que l'utilisateur existe
            const existingUser = await this.userService.findById(id);
            if (!existingUser) {
                res.status(404).json({ message: 'Utilisateur non trouvé' });
                return;
            }
            await this.userService.delete(id);
            res.status(204).send();
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la suppression de l'utilisateur ${req.params.id}`, error);
            res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user-controller.js.map