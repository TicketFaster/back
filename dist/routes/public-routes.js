"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../utils/database");
const router = express_1.default.Router();
/**
 * @route GET /api/public/clients
 * @desc Récupérer tous les clients sans authentification
 * @access Public
 */
router.get('/clients', async (req, res) => {
    try {
        // Accès direct à la base de données avec une requête SQL
        const clients = await database_1.AppDataSource.query('SELECT * FROM client');
        return res.status(200).json(clients);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        // @ts-ignore
        return res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});
/**
 * @route GET /api/public/test
 * @desc Simple test pour vérifier que l'API fonctionne
 * @access Public
 */
router.get('/test', (req, res) => {
    return res.status(200).json({ message: 'API accessible sans authentification' });
});
exports.default = router;
//# sourceMappingURL=public-routes.js.map