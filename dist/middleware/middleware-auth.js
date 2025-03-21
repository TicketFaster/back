"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_utility_1 = require("../utils/logger-utility");
const authMiddleware = (req, res, next) => {
    try {
        // Récupérer le token depuis l'en-tête Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentification requise' });
        }
        const token = authHeader.split(' ')[1];
        // Vérifier le token
        const secretKey = process.env.JWT_SECRET || 'billetterie-default-secret';
        const decoded = jsonwebtoken_1.default.verify(token, secretKey);
        // Ajouter les informations de l'utilisateur à la requête
        req.user = decoded;
        next();
    }
    catch (error) {
        logger_utility_1.logger.error('Erreur d\'authentification', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expirée, veuillez vous reconnecter' });
        }
        return res.status(401).json({ message: 'Authentification invalide' });
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
    // Vérifier si l'utilisateur est un administrateur
    if (req.user && req.user.role === 'ADMIN') {
        next();
    }
    else {
        return res.status(403).json({ message: 'Accès non autorisé' });
    }
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=middleware-auth.js.map