"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth-routes"));
const evenement_routes_1 = __importDefault(require("./routes/evenement.routes"));
const salle_routes_1 = __importDefault(require("./routes/salle-routes"));
const seance_routes_1 = __importDefault(require("./routes/seance-routes"));
const client_routes_1 = __importDefault(require("./routes/client-routes"));
const reservation_routes_1 = __importDefault(require("./routes/reservation-routes"));
const billet_routes_1 = __importDefault(require("./routes/billet-routes"));
const rapport_routes_1 = __importDefault(require("./routes/rapport-routes"));
const scanner_routes_1 = __importDefault(require("./routes/scanner-routes"));
// Middleware
const middleware_error_1 = require("./middleware/middleware-error");
// Utilities
const logger_utility_1 = require("./utils/logger-utility");
const public_routes_1 = __importDefault(require("./routes/public-routes"));
// Charger les variables d'environnement
dotenv_1.default.config();
// Créer l'application Express
const app = (0, express_1.default)();
// Configurer les middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging des requêtes
app.use((req, res, next) => {
    logger_utility_1.logger.info(`${req.method} ${req.originalUrl}`);
    next();
});
// Routes
app.use('/api/public', public_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/evenements', evenement_routes_1.default);
app.use('/api/salles', salle_routes_1.default);
app.use('/api/seances', seance_routes_1.default);
app.use('/api/clients', client_routes_1.default);
app.use('/api/reservations', reservation_routes_1.default);
app.use('/api/billets', billet_routes_1.default);
app.use('/api/rapports', rapport_routes_1.default);
app.use('/api/scanner', scanner_routes_1.default);
// Route pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenue sur l\'API de billetterie',
        version: '1.0.0',
        status: 'running'
    });
});
// Gestion des routes non trouvées
app.use(middleware_error_1.notFoundMiddleware);
// Middleware d'erreur global
app.use(middleware_error_1.errorMiddleware);
exports.default = app;
//# sourceMappingURL=app-setup.js.map