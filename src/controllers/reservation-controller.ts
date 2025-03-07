import { Request, Response } from 'express';
import { ReservationService } from '../services/reservation-service';
import { logger } from '../utils/logger-utility';

export class ReservationController {
  private reservationService = new ReservationService();

  async getAllReservations(req: Request, res: Response): Promise<void> {
    try {
      const reservations = await this.reservationService.findAll();
      res.status(200).json(reservations);
    } catch (error) {
      logger.error('Erreur lors de la récupération des réservations', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des réservations' });
    }
  }

  async getReservationById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const reservation = await this.reservationService.findOne(id);
      
      if (reservation) {
        res.status(200).json(reservation);
      } else {
        res.status(404).json({ message: 'Réservation non trouvée' });
      }
    } catch (error) {
      logger.error(`Erreur lors de la récupération de la réservation ${req.params.id}`, error);
      res.status(500).json({ message: 'Erreur lors de la récupération de la réservation' });
    }
  }

  async getReservationsByClient(req: Request, res: Response): Promise<void> {
    try {
      const clientId = parseInt(req.params.clientId);
      const reservations = await this.reservationService.findByClient(clientId);
      res.status(200).json(reservations);
    } catch (error) {
      logger.error(`Erreur lors de la récupération des réservations du client ${req.params.clientId}`, error);
      res.status(500).json({ message: 'Erreur lors de la récupération des réservations du client' });
    }
  }

  async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservationData = req.body;
      
      // Validation des données
      if (!reservationData.id_client || !reservationData.billets || !Array.isArray(reservationData.billets) || reservationData.billets.length === 0) {
        res.status(400).json({ message: 'Données de réservation invalides' });
        return;
      }

      const newReservation = await this.reservationService.create(reservationData);
      res.status(201).json(newReservation);
    } catch (error) {
      logger.error('Erreur lors de la création d\'une réservation', error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors de la création de la réservation' });
      }
    }
  }

  async updateReservationStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { statut_paiement } = req.body;
      
      if (!statut_paiement) {
        res.status(400).json({ message: 'Le statut de paiement est requis' });
        return;
      }

      const updatedReservation = await this.reservationService.updateStatus(id, statut_paiement);
      
      if (updatedReservation) {
        res.status(200).json(updatedReservation);
      } else {
        res.status(404).json({ message: 'Réservation non trouvée' });
      }
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour du statut de la réservation ${req.params.id}`, error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de la réservation' });
    }
  }
}
