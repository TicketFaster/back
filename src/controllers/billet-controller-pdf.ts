import { Request, Response } from 'express';
import fs from 'fs';
import { BilletService } from '../services/billet-service';
import { PDFService } from '../services/pdf-service';
import { logger } from '../utils/logger-utility';

export class BilletController {
  private billetService = new BilletService();
  private pdfService = new PDFService();

  /**
   * Récupère tous les billets avec filtrage optionnel
   */
  async getAllBillets(req: Request, res: Response): Promise<void> {
    try {
      const filtres = {
        reservationId: req.query.reservationId ? parseInt(req.query.reservationId as string) : undefined,
        seanceId: req.query.seanceId ? parseInt(req.query.seanceId as string) : undefined,
        statut: req.query.statut as string,
        typeTarif: req.query.typeTarif as string
      };

      const billets = await this.billetService.getAllBillets(filtres);
      res.status(200).json(billets);
    } catch (error) {
      logger.error('Erreur lors de la récupération des billets', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des billets' });
    }
  }

  /**
   * Récupère un billet par son ID
   */
  async getBilletById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const billet = await this.billetService.getBilletById(id);
      
      if (billet) {
        res.status(200).json(billet);
      } else {
        res.status(404).json({ message: 'Billet non trouvé' });
      }
    } catch (error) {
      logger.error(`Erreur lors de la récupération du billet ${req.params.id}`, error);
      res.status(500).json({ message: 'Erreur lors de la récupération du billet' });
    }
  }

  /**
   * Récupère un billet par son code-barre
   */
  async getBilletByCodeBarre(req: Request, res: Response): Promise<void> {
    try {
      const codeBarre = req.params.codeBarre;
      const billet = await this.billetService.getBilletByCodeBarre(codeBarre);
      
      if (billet) {
        res.status(200).json(billet);
      } else {
        res.status(404).json({ message: 'Billet non trouvé' });
      }
    } catch (error) {
      logger.error(`Erreur lors de la récupération du billet avec code-barre ${req.params.codeBarre}`, error);
      res.status(500).json({ message: 'Erreur lors de la récupération du billet' });
    }
  }

  /**
   * Crée un nouveau billet
   */
  async createBillet(req: Request, res: Response): Promise<void> {
    try {
      const billetData = req.body;
      
      if (!billetData.id_reservation || !billetData.id_seance || !billetData.type_tarif) {
        res.status(400).json({ message: 'Données incomplètes pour la création du billet' });
        return;
      }

      const nouveauBillet = await this.billetService.createBillet(billetData);
      res.status(201).json(nouveauBillet);
    } catch (error) {
      logger.error('Erreur lors de la création du billet', error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors de la création du billet' });
      }
    }
  }

  /**
   * Met à jour le statut d'un billet
   */
  async updateBilletStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { statut } = req.body;
      
      if (!statut) {
        res.status(400).json({ message: 'Le statut est requis' });
        return;
      }

      const billet = await this.billetService.updateBilletStatus(id, statut);
      res.status(200).json(billet);
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour du statut du billet ${req.params.id}`, error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du statut du billet' });
      }
    }
  }

  /**
   * Supprime un billet
   */
  async deleteBillet(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await this.billetService.deleteBillet(id);
      res.status(204).send();
    } catch (error) {
      logger.error(`Erreur lors de la suppression du billet ${req.params.id}`, error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors de la suppression du billet' });
      }
    }
  }

  /**
   * Valide un billet lors du scan
   */
  async scannerBillet(req: Request, res: Response): Promise<void> {
    try {
      const { codeBarre } = req.body;
      
      if (!codeBarre) {
        res.status(400).json({ message: 'Le code-barre est requis' });
        return;
      }

      const resultat = await this.billetService.scannerBillet(codeBarre);
      res.status(200).json(resultat);
    } catch (error) {
      logger.error('Erreur lors de la validation du billet', error);
      
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erreur lors de la validation du billet' });
      }
    }
  }

  /**
   * Génère un PDF pour un billet et le renvoie au client
   */
  async generatePDF(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      // Récupérer le billet avec toutes ses relations
      const billet = await this.billetService.getBilletById(id);
      
      if (!billet) {
        res.status(404).json({ message: 'Billet non trouvé' });
        return;
      }
      
      // Générer le PDF
      const pdfPath = await this.pdfService.generateBilletPDF(billet);
      
      // Envoyer le fichier
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=billet_${id}.pdf`);
      
      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
      
      // Supprimer le fichier temporaire après envoi
      fileStream.on('end', () => {
        fs.unlink(pdfPath, (err) => {
          if (err) {
            logger.warn(`Impossible de supprimer le fichier PDF temporaire: ${err.message}`);
          }
        });
      });
    } catch (error) {
      logger.error(`Erreur lors de la génération du PDF pour le billet ${req.params.id}`, error);
      res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
    }
  }

  /**
   * Génère un PDF contenant tous les billets d'une réservation et le renvoie au client
   */
  async generateReservationPDF(req: Request, res: Response): Promise<void> {
    try {
      const reservationId = parseInt(req.params.reservationId);
      
      // Récupérer les billets de la réservation
      const billets = await this.billetService.getAllBillets({ reservationId });
      
      if (!billets || billets.length === 0) {
        res.status(404).json({ message: 'Aucun billet trouvé pour cette réservation' });
        return;
      }
      
      // Générer le PDF
      const pdfPath = await this.pdfService.generateMultipleBilletsPDF(billets);
      
      // Envoyer le fichier
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reservation_${reservationId}_billets.pdf`);
      
      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
      
      // Supprimer le fichier temporaire après envoi
      fileStream.on('end', () => {
        fs.unlink(pdfPath, (err) => {
          if (err) {
            logger.warn(`Impossible de supprimer le fichier PDF temporaire: ${err.message}`);
          }
        });
      });
    } catch (error) {
      logger.error(`Erreur lors de la génération du PDF pour la réservation ${req.params.reservationId}`, error);
      res.status(500).json({ message: 'Erreur lors de la génération du PDF' });
    }
  }
}