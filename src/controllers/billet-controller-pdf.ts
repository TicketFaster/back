import { Request, Response } from 'express';
import fs from 'fs';
import { BilletService } from '../services/billet.service';
import { PDFService } from '../services/pdf.service';
import { logger } from '../utils/logger';

export class BilletController {
  private billetService = new BilletService();
  private pdfService = new PDFService();

  // ... autres méthodes existantes ...

  /**
   * Génère un PDF pour un billet et le renvoie au client
   */
  async generatePDF(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      // Récupérer le billet avec toutes ses relations
      const billet = await this.billetService.getBilletWithRelations(id);
      
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
      
      // Récupérer les billets de la réservation avec toutes leurs relations
      const billets = await this.billetService.getBilletsForReservation(reservationId);
      
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
