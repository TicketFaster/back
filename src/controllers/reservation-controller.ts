import { Request, Response } from 'express';
import { ReservationService } from '../services/reservation-service';
import { logger } from '../utils/logger-utility';

export class ReservationController {
  private reservationService = new ReservationService();

  /**
   * Récupère toutes les réservations avec filtrage optionnel
   */
  async getAllReservations(req: Request, res: Response): Promise<void> {
    try {
      const filtres = {
        clientId: req.query.clientId ? parseInt(req.query.clientId as string) : undefined,
        statut: req.query.statut as string,
        dateMin: req.query.dateMin ? new Date(req.query.dateMin as string) : undefined,
        dateMax: req.query.dateMax ? new Date(req.query.dateMax as string) : undefined
      };

      const reservations = await this.reservationService.getAllReservations(filtres);
      res.status(200).json(reservations);
    } catch (error) {
      logger.error('Erreur lors de la récupération des réservations', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des réservations' });
    }
  }

  /**
   * Récupère une réservation par son ID
   */
  async getReservationById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const reservation = await this.reservationService.getReservationById(id);
      
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

  /**
   * Récupère les réservations d'un client
   */
  async getReservationsByClient(req: Request, res: Response): Promise<void> {
    try {
      const clientId = parseInt(req.params.clientId);
      const reservations = await this.reservationService.getAllReservations({ clientId });
      res.status(200).json(reservations);
    } catch (error) {
      logger.error(`Erreur lors de la récupération des réservations du client ${req.params.clientId}`, error);
      res.status(500).json({ message: 'Erreur lors de la récupération des réservations du client' });
    }
  }

  /**
   * Crée une nouvelle réservation avec ses billets
   */
  async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservationData = req.body;
      
      // Validation des données
      if (!reservationData.id_client || !reservationData.billets || !Array.isArray(reservationData.billets) || reservationData.billets.length === 0) {
        res.status(400).json({ message: 'Données de réservation invalides' });
        return;
      }

      const newReservation = await this.reservationService.createReservation(reservationData);
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

  /**
   * Met à jour une réservation existante
   */
  async updateReservation(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const modificationData = req.body;
      
      // Validation de base
      if (!id || !modificationData) {
        res.status(400).json({ message: 'Données de mise à jour invalides' });
        return;
      }

      const updatedReservation = await this.reservationService.updateReservation(id, modificationData);
      res.status(200).json(updatedReservation);
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de la réservation ${req.params.id}`, error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la réservation' });
      }
    }
  }

  /**
   * Met à jour uniquement le statut d'une réservation
   */
  async updateReservationStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { statut_paiement } = req.body;
      
      if (!statut_paiement) {
        res.status(400).json({ message: 'Le statut de paiement est requis' });
        return;
      }

      const updatedReservation = await this.reservationService.updateReservation(id, { statut_paiement });
      
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

  /**
   * Annule une réservation et tous ses billets
   */
  async cancelReservation(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const canceledReservation = await this.reservationService.cancelReservation(id);
      res.status(200).json(canceledReservation);
    } catch (error) {
      logger.error(`Erreur lors de l'annulation de la réservation ${req.params.id}`, error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors de l\'annulation de la réservation' });
      }
    }
  }

  /**
   * Supprime une réservation et tous ses billets
   */
  async deleteReservation(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.reservationService.deleteReservation(id);
      res.status(204).send();
    } catch (error) {
      logger.error(`Erreur lors de la suppression de la réservation ${req.params.id}`, error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors de la suppression de la réservation' });
      }
    }
  }
}