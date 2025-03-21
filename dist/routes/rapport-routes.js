"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rapport_controller_1 = require("../controllers/rapport-controller");
const middleware_auth_1 = require("../middleware/middleware-auth");
const router = (0, express_1.Router)();
const rapportController = new rapport_controller_1.RapportController();
// Rapport de ventes pour une période
router.get('/ventes', middleware_auth_1.authMiddleware, (req, res) => rapportController.genererRapportVentes(req, res));
// Statistiques client
router.get('/client/:clientId', middleware_auth_1.authMiddleware, (req, res) => rapportController.getStatistiquesClient(req, res));
// Disponibilités sur une période pour un événement
router.get('/disponibilites/:evenementId', middleware_auth_1.authMiddleware, (req, res) => rapportController.getDisponibilitesPeriode(req, res));
// Taux de remplissage d'une séance
router.get('/taux-remplissage/:seanceId', middleware_auth_1.authMiddleware, (req, res) => rapportController.getTauxRemplissage(req, res));
// Calcul du prix réduit
router.post('/calcul-prix', middleware_auth_1.authMiddleware, (req, res) => rapportController.calculerPrixReduit(req, res));
// Ventes par catégorie d'événement
router.get('/ventes-par-categorie', middleware_auth_1.authMiddleware, (req, res) => rapportController.getVentesParCategorie(req, res));
// Ventes par mois
//router.get('/ventes-par-mois/:annee?', authMiddleware, (req, res) => rapportController.getVentesParMois(req, res));
// Ventes par type de tarif
//router.get('/ventes-par-tarif', authMiddleware, (req, res) => rapportController.getVentesParTypeTarif(req, res));
exports.default = router;
//# sourceMappingURL=rapport-routes.js.map