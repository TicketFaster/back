import { Request, Response } from 'express';
import { EvenementService } from '../services/evenement-service';
import { logger } from '../utils/logger-utility';

export class EvenementController {
  private evenementService = new EvenementService();

  /**
   * Récupère tous les événements
   */
  async getAllEvenements(req: Request, res: Response): Promise<void> {
    try {
      const evenements = await this.evenementService.findAll();
      res.status(200).json(evenements);
    } catch (error) {
      logger.error('Erreur lors de la récupération des événements', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
    }
  }

  /**
   * Récupère un événement par son ID
   */
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

  /**
   * Crée un nouvel événement
   */
  async createEvenement(req: Request, res: Response): Promise<void> {
    try {
      const evenementData = req.body;
      
      // Validation de base
      if (!evenementData.titre || !evenementData.categorie || !evenementData.duree || !evenementData.prix_standard) {
        res.status(400).json({ message: 'Données événement incomplètes' });
        return;
      }

      const newEvenement = await this.evenementService.create(evenementData);
      res.status(201).json(newEvenement);
    } catch (error) {
      logger.error('Erreur lors de la création d\'un événement', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'événement' });
    }
  }

  /**
   * Met à jour un événement existant
   */
  async updateEvenement(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const evenementData = req.body;
      
      // Vérifier que l'événement existe
      const existingEvenement = await this.evenementService.findOne(id);
      if (!existingEvenement) {
        res.status(404).json({ message: 'Événement non trouvé' });
        return;
      }

      const updatedEvenement = await this.evenementService.update(id, evenementData);
      res.status(200).json(updatedEvenement);
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de l'événement ${req.params.id}`, error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
    }
  }

  /**
   * Supprime un événement
   */
  async deleteEvenement(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      // Vérifier que l'événement existe
      const existingEvenement = await this.evenementService.findOne(id);
      if (!existingEvenement) {
        res.status(404).json({ message: 'Événement non trouvé' });
        return;
      }

      await this.evenementService.delete(id);
      res.status(204).send();
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'événement ${req.params.id}`, error);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement' });
    }
  }

  /**
   * Recherche des événements par critères
   */
  async searchEvenements(req: Request, res: Response): Promise<void> {
    try {
      const { titre, categorie, dateDebut, dateFin } = req.query;
      
      // Créer l'objet de filtres
      const filtres: any = {};
      if (titre) filtres.titre = titre;
      if (categorie) filtres.categorie = categorie;
      if (dateDebut) filtres.dateDebut = new Date(dateDebut as string);
      if (dateFin) filtres.dateFin = new Date(dateFin as string);
      
      // Pour cet endpoint, j'imagine une méthode de recherche qui n'existe pas 
      // dans le service actuel mais qui pourrait être implémentée
      const evenements = await this.evenementService.findAll();
      
      // Filtrage côté client (normalement, ce serait fait dans le service ou la base de données)
      let resultats = evenements;
      
      if (titre) {
        resultats = resultats.filter(ev => 
          ev.titre.toLowerCase().includes((titre as string).toLowerCase())
        );
      }
      
      if (categorie) {
        resultats = resultats.filter(ev => 
          ev.categorie === categorie
        );
      }
      
      res.status(200).json(resultats);
    } catch (error) {
      logger.error('Erreur lors de la recherche d\'événements', error);
      res.status(500).json({ message: 'Erreur lors de la recherche d\'événements' });
    }
  }
}