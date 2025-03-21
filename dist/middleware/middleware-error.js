"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = exports.errorMiddleware = void 0;
const logger_utility_1 = require("../utils/logger-utility");
const errorMiddleware = (err, req, res, next) => {
    // Journaliser l'erreur
    logger_utility_1.logger.error(`Erreur non gérée: ${err.message}`, {
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });
    // Déterminer le code d'état HTTP approprié
    let statusCode = 500;
    let errorMessage = 'Une erreur serveur est survenue';
    if (err.statusCode) {
        statusCode = err.statusCode;
    }
    if (err.message && process.env.NODE_ENV !== 'production') {
        errorMessage = err.message;
    }
    // Répondre au client
    res.status(statusCode).json({
        error: true,
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
exports.errorMiddleware = errorMiddleware;
// Middleware pour gérer les routes qui n'existent pas
const notFoundMiddleware = (req, res, next) => {
    const error = new Error(`Route non trouvée - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
exports.notFoundMiddleware = notFoundMiddleware;
//# sourceMappingURL=middleware-error.js.map