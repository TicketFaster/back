"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scanner_controller_1 = require("../controllers/scanner-controller");
const middleware_auth_1 = require("../middleware/middleware-auth");
const router = (0, express_1.Router)();
const scannerController = new scanner_controller_1.ScannerController();
// Vérifier l'authenticité d'un billet par son code-barres
router.post('/validate', middleware_auth_1.authMiddleware, (req, res) => scannerController.validateBillet(req, res));
// Marquer un billet comme utilisé
router.post('/mark-used/:id', middleware_auth_1.authMiddleware, (req, res) => scannerController.markBilletAsUsed(req, res));
// Récupérer les statistiques d'utilisation
router.get('/stats', middleware_auth_1.authMiddleware, (req, res) => scannerController.getUsageStatistics(req, res));
exports.default = router;
//# sourceMappingURL=scanner-routes.js.map