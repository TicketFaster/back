import { Request, Response } from 'express';
import { EvenementService } from '../services/evenement-service';
import { logger } from '../utils/logger-utility';

export class EvenementController {
  private evenementService = new EvenementService();

  async getAllEvenements(req: Request, res: Response): Promise<void> {
    try {
      const evenements = await this.evenementService.findAll();
      res.status(200).json(evenements);
    } catch (error) {
      logger.error('Erreur lors de la récupération des événements', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
    }
  }

  async getEvenementById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const evenement = await this.evenementService.findOne(id);
      
      if (evenement) {
        res.status(200).json(evenement);
      } else {
        res.status(404).json({ message: 'Événement non trouvé' });
      }
    } catch (error) {
      logger.error(`Erreur lors de la récupération de l'événement ${req.params.id}`, error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement' });
    }
  }

  async createEvenement(req: Request, res: Response): Promise<void> {
    try {
      const evenementData = req.body;
      const newEvenement = await this.evenementService.create(evenementData);
      res.status(201).json(newEvenement);
    } catch (error) {
      logger.error('Erreur lors de la création d\'un événement', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'événement' });
    }
  }

  async updateEvenement(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const evenementData = req.body;
      const updatedEvenement = await this.evenementService.update(id, evenementData);
      
      if (updatedEvenement) {
        res.status(200).json(updatedEvenement);
      } else {
        res.status(404).json({ message: 'Événement non trouvé' });
      }
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de l'événement ${req.params.id}`, error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
    }
  }

  async deleteEvenement(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.evenementService.delete(id);
      res.status(204).send();
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'événement ${req.params.id}`, error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement' });
    }
  }
}
