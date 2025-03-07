"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_utility_1 = require("../utils/logger-utility");
const user_service_1 = require("../services/user-service");
class AuthController {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    /**
     * Connecte un utilisateur
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
                return;
            }
            // Récupérer l'utilisateur
            const user = await this.userService.findByUsername(username);
            if (!user) {
                res.status(401).json({ message: 'Identifiants incorrects' });
                return;
            }
            // Vérifier le mot de passe
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                res.status(401).json({ message: 'Identifiants incorrects' });
                return;
            }
            // Générer le token JWT
            const token = this.generateToken(user);
            // Renvoyer le token et les infos utilisateur (sans le mot de passe)
            const { password: _, ...userWithoutPassword } = user;
            res.status(200).json({
                token,
                user: userWithoutPassword
            });
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la connexion', error);
            res.status(500).json({ message: 'Erreur lors de la connexion' });
        }
    }
    /**
     * Rafraîchit le token d'un utilisateur
     */
    async refreshToken(req, res) {
        try {
            // L'utilisateur est déjà authentifié grâce au middleware auth
            const user = req.user;
            if (!user) {
                res.status(401).json({ message: 'Authentification requise' });
                return;
            }
            // Récupérer l'utilisateur depuis la base de données pour avoir des infos à jour
            const dbUser = await this.userService.findById(user.id);
            if (!dbUser) {
                res.status(401).json({ message: 'Utilisateur non trouvé' });
                return;
            }
            // Générer un nouveau token
            const token = this.generateToken(dbUser);
            // Renvoyer le token et les infos utilisateur (sans le mot de passe)
            const { password: _, ...userWithoutPassword } = dbUser;
            res.status(200).json({
                token,
                user: userWithoutPassword
            });
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors du rafraîchissement du token', error);
            res.status(500).json({ message: 'Erreur lors du rafraîchissement du token' });
        }
    }
    /**
     * Génère un token JWT pour un utilisateur
     */
    generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        const secretKey = process.env.JWT_SECRET || 'billetterie-default-secret';
        const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        return jsonwebtoken_1.default.sign(payload, secretKey, { expiresIn });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth-controller.js.map