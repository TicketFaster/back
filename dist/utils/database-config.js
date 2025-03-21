"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_utility_1 = require("./logger-utility");
dotenv_1.default.config();
// Configuration avec logging complet
console.log('Tentative de connexion à la base de données avec les paramètres:');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port: ${process.env.DB_PORT || '5433'}`);
console.log(`User: ${process.env.DB_USERNAME || 'postgres'}`);
console.log(`Database: ${process.env.DB_NAME || 'billetterie'}`);
// Connexion avec paramètres explicites et authentification trust
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'billetterie'
});
// Fonction d'initialisation
const initializeDatabase = async () => {
    try {
        const client = await pool.connect();
        logger_utility_1.logger.info('Connexion à la base de données PostgreSQL établie avec succès');
        client.release();
        return pool;
    }
    catch (err) {
        logger_utility_1.logger.error(`Erreur lors de la connexion à la base de données ${err.message}`);
        console.error('Détails de l\'erreur:', err);
        throw err;
    }
};
exports.initializeDatabase = initializeDatabase;
exports.default = pool;
//# sourceMappingURL=database-config.js.map