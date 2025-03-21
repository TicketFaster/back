"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
// Charger les variables d'environnement
dotenv_1.default.config();
// Si les entités ne sont pas trouvées correctement, essayez avec cette approche alternative
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "billetterie",
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: [
        // Spécifier le chemin plutôt que d'utiliser les références d'importation
        // Cette approche est plus robuste pour trouver les métadonnées
        __dirname + '/../entities/*.js'
    ],
    subscribers: [],
    migrations: []
});
//# sourceMappingURL=database.js.map