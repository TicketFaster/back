import { Router } from 'express';
import { ReservationController } from '../controllers/reservation-controller';

const router = Router();
const reservationController = new ReservationController();

// Récupérer toutes les réservations
router.get('/', (req, res) => reservationController.getAllReservations(req, res));

// Récupérer une réservation par son ID
router.get('/:id', (req, res) => reservationController.getReservationById(req, res));

// Récupérer les réservations d'un client
router.get('/client/:clientId', (req, res) => reservationController.getReservationsByClient(req, res));

// Créer une nouvelle réservation
router.post('/', (req, res) => reservationController.createReservation(req, res));

// Mettre à jour le statut d'une réservation
router.patch('/:id/status', (req, res) => reservationController.updateReservationStatus(req, res));

export default router;
