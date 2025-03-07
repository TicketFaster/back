"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const evenement_controller_1 = require("../controllers/evenement-controller");
const router = (0, express_1.Router)();
const evenementController = new evenement_controller_1.EvenementController();
// Récupérer tous les événements
router.get('/', (req, res) => evenementController.getAllEvenements(req, res));
// Récupérer un événement par son ID
router.get('/:id', (req, res) => evenementController.getEvenementById(req, res));
// Créer un nouvel événement
router.post('/', (req, res) => evenementController.createEvenement(req, res));
// Mettre à jour un événement
router.put('/:id', (req, res) => evenementController.updateEvenement(req, res));
// Supprimer un événement
router.delete('/:id', (req, res) => evenementController.deleteEvenement(req, res));
exports.default = router;
//# sourceMappingURL=evenement.routes.js.map