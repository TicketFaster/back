"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const evenement_entity_1 = require("../entities/evenement-entity");
const salle_entity_1 = require("../entities/salle-entity");
const seance_entity_1 = require("../entities/seance-entity");
const client_entity_1 = require("../entities/client-entity");
const reservation_entity_1 = require("../entities/reservation-entity");
const billet_entity_1 = require("../entities/billet-entity");
const historique_reservation_entity_1 = require("../entities/historique-reservation-entity");
const user_entity_1 = require("../entities/user-entity");
const logger_1 = require("./logger");
const dotenv_1 = __importDefault(require("dotenv"));
// Charger les variables d'environnement
dotenv_1.default.config();
// Configuration de la base de données
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "billetterie",
    synchronize: process.env.NODE_ENV === "development", // Ne pas utiliser en production
    logging: process.env.NODE_ENV === "development",
    entities: [
        evenement_entity_1.Evenement,
        salle_entity_1.Salle,
        seance_entity_1.Seance,
        client_entity_1.Client,
        reservation_entity_1.Reservation,
        billet_entity_1.Billet,
        historique_reservation_entity_1.HistoriqueReservation,
        user_entity_1.User
    ],
    migrations: ["src/migrations/**/*.ts"],
    subscribers: ["src/subscribers/**/*.ts"],
    connectTimeoutMS: 10000,
    maxQueryExecutionTime: 5000 // Journaliser les requêtes qui prennent plus de 5s
});
// Fonction pour initialiser la connexion à la base de données
const initDatabase = async () => {
    try {
        await exports.AppDataSource.initialize();
        logger_1.logger.info("Connexion à la base de données établie");
    }
    catch (error) {
        logger_1.logger.error(`Erreur lors de la connexion à la base de données: ${error}`);
        throw error;
    }
};
exports.initDatabase = initDatabase;
//# sourceMappingURL=database.js.map