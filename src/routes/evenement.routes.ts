import { Router } from 'express';
import { EvenementController } from '../controllers/evenement-controller';

const router = Router();
const evenementController = new EvenementController();

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

export default router;
