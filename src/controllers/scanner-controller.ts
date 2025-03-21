import { Request, Response } from 'express';
import { BilletService } from '../services/billet-service';
import { logger } from '../utils/logger-utility';

export class ScannerController {
  private billetService = new BilletService();

  /**
   * Valide un billet par son code-barres
   */
  async validateBillet(req: Request, res: Response): Promise<void> {
    try {
      const { code_barres } = req.body;
      
      if (!code_barres) {
        res.status(400).json({ 
          valide: false, 
          message: 'Le code-barres est requis'
        });
        return;
      }

      const result = await this.billetService.scannerBillet(code_barres);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Erreur lors de la validation du billet', error);
      
      let message = 'Erreur lors de la validation du billet';
      if (error instanceof Error) {
        message = error.message;
      }
      
      res.status(500).json({ 
        valide: false, 
        message: message
      });
    }
  }

  /**
   * Marque un billet comme utilisé
   */
  async markBilletAsUsed(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      // Vérifier si le billet existe et est valide
      const billet = await this.billetService.getBilletById(id);
      
      if (!billet) {
        res.status(404).json({
          success: false,
          message: 'Billet non trouvé'
        });
        return;
      }
      
      if (billet.statut !== 'VALIDE') {
        res.status(400).json({
          success: false,
          message: `Billet non valide (statut actuel: ${billet.statut})`
        });
        return;
      }
      
      // Marquer le billet comme utilisé
      const updatedBillet = await this.billetService.updateBilletStatus(id, 'UTILISE');
      
      res.status(200).json({
        success: true,
        message: 'Billet marqué comme utilisé avec succès',
        billet: updatedBillet
      });
    } catch (error) {
      logger.error(`Erreur lors du marquage du billet ${req.params.id} comme utilisé`, error);
      
      let message = 'Erreur lors du marquage du billet comme utilisé';
      if (error instanceof Error) {
        message = error.message;
      }
      
      res.status(500).json({
        success: false,
        message: message
      });
    }
  }

  /**
   * Récupère les statistiques d'utilisation des billets en temps réel
   */
  async getUsageStatistics(req: Request, res: Response): Promise<void> {
    try {
      const seanceId = req.query.seanceId ? parseInt(req.query.seanceId as string) : undefined;
      const evenementId = req.query.evenementId ? parseInt(req.query.evenementId as string) : undefined;
      
      // Créer un filtre pour les billets
      const filtres: any = {};
      if (seanceId) filtres.seanceId = seanceId;
      
      // Récupérer les billets selon les filtres
      const billets = await this.billetService.getAllBillets(filtres);
      
      // Calculer les statistiques
      const statistiques = {
        total: billets.length,
        utilises: billets.filter(b => b.statut === 'UTILISE').length,
        valides: billets.filter(b => b.statut === 'VALIDE').length,
        annules: billets.filter(b => b.statut === 'ANNULE').length,
        tauxUtilisation: 0
      };
      
      // Calculer le taux d'utilisation
      const billetsValides = statistiques.valides + statistiques.utilises;
      if (billetsValides > 0) {
        statistiques.tauxUtilisation = Math.round((statistiques.utilises / billetsValides) * 100);
      }
      
      res.status(200).json(statistiques);
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques d\'utilisation', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des statistiques d\'utilisation' });
    }
  }

  /**
   * Scanne et valide un billet pour un accès immédiat
   */
  async scanAndValidate(req: Request, res: Response): Promise<void> {
    try {
      const { code_barres } = req.body;
      
      if (!code_barres) {
        res.status(400).json({ 
          valide: false, 
          message: 'Le code-barres est requis'
        });
        return;
      }
      
      // D'abord scanner le billet
      const scanResult = await this.billetService.scannerBillet(code_barres);
      
      // Si le billet n'est pas valide, retourner le résultat
      if (!scanResult.valide) {
        res.status(200).json(scanResult);
        return;
      }
      
      // Si le billet est valide, le marquer comme utilisé
      const billet = scanResult.billet;
      await this.billetService.updateBilletStatus(billet.id, 'UTILISE');
      
      // Retourner le résultat
      res.status(200).json({
        valide: true,
        message: 'Billet validé et marqué comme utilisé',
        billet: {
          ...billet,
          statut: 'UTILISE'
        },
        seance: scanResult.seance
      });
    } catch (error) {
      logger.error('Erreur lors du scan et de la validation du billet', error);
      
      let message = 'Erreur lors du scan et de la validation du billet';
      if (error instanceof Error) {
        message = error.message;
      }
      
      res.status(500).json({ 
        valide: false, 
        message: message
      });
    }
  }
}