import { Router } from 'express';
import { RapportController } from '../controllers/rapport-controller';
import { authMiddleware } from '../middleware/middleware-auth';

const router = Router();
const rapportController = new RapportController();

// Rapport de ventes pour une période
router.get('/ventes', authMiddleware, (req, res) => rapportController.genererRapportVentes(req, res));

// Statistiques client
router.get('/client/:clientId', authMiddleware, (req, res) => rapportController.getStatistiquesClient(req, res));

// Disponibilités sur une période pour un événement
router.get('/disponibilites/:evenementId', authMiddleware, (req, res) => rapportController.getDisponibilitesPeriode(req, res));

// Taux de remplissage d'une séance
router.get('/taux-remplissage/:seanceId', authMiddleware, (req, res) => rapportController.getTauxRemplissage(req, res));

// Calcul du prix réduit
router.post('/calcul-prix', authMiddleware, (req, res) => rapportController.calculerPrixReduit(req, res));

// Ventes par catégorie d'événement
router.get('/ventes-par-categorie', authMiddleware, (req, res) => rapportController.getVentesParCategorie(req, res));

// Ventes par mois
//router.get('/ventes-par-mois/:annee?', authMiddleware, (req, res) => rapportController.getVentesParMois(req, res));

// Ventes par type de tarif
//router.get('/ventes-par-tarif', authMiddleware, (req, res) => rapportController.getVentesParTypeTarif(req, res));

export default router;
