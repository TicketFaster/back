"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const app_setup_1 = __importDefault(require("./app-setup"));
const database_config_1 = require("./utils/database-config");
const logger_utility_1 = require("./utils/logger-utility");
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        // Initialiser la connexion à la base de données
        await (0, database_config_1.initializeDatabase)();
        // Démarrer le serveur
        app_setup_1.default.listen(PORT, () => {
            logger_utility_1.logger.info(`Serveur démarré sur le port ${PORT}`);
        });
    }
    catch (error) {
        logger_utility_1.logger.error('Erreur lors du démarrage du serveur', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map