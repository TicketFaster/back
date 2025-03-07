"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScannerController = void 0;
const billet_service_1 = require("../services/billet.service");
const logger_1 = require("../utils/logger");
class ScannerController {
    constructor() {
        this.billetService = new billet_service_1.BilletService();
    }
    /**
     * Valide un billet par son code-barres
     */
    async validateBillet(req, res) {
        try {
            const { code_barres } = req.body;
            if (!code_barres) {
                res.status(400).json({
                    valid: false,
                    message: 'Le code-barres est requis'
                });
                return;
            }
            const result = await this.billetService.validateBilletByCodeBarres(code_barres);
            res.status(200).json(result);
        }
        catch (error) {
            logger_1.logger.error('Erreur lors de la validation du billet', error);
            res.status(500).json({
                valid: false,
                message: 'Erreur lors de la validation du billet'
            });
        }
    }
    /**
     * Marque un billet comme utilisé
     */
    async markBilletAsUsed(req, res) {
        try {
            const id = parseInt(req.params.id);
            const billet = await this.billetService.markBilletAsUsed(id);
            if (billet) {
                res.status(200).json({
                    success: true,
                    message: 'Billet marqué comme utilisé avec succès',
                    billet
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    message: 'Billet non trouvé'
                });
            }
        }
        catch (error) {
            logger_1.logger.error(`Erreur lors du marquage du billet ${req.params.id} comme utilisé`, error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du marquage du billet comme utilisé'
            });
        }
    }
    /**
     * Récupère les statistiques d'utilisation des billets en temps réel
     */
    async getUsageStatistics(req, res) {
        try {
            const eventId = req.query.eventId ? parseInt(req.query.eventId) : undefined;
            const stats = await this.billetService.getUsageStatistics(eventId);
            res.status(200).json(stats);
        }
        catch (error) {
            logger_1.logger.error('Erreur lors de la récupération des statistiques d\'utilisation', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des statistiques d\'utilisation' });
        }
    }
}
exports.ScannerController = ScannerController;
//# sourceMappingURL=scanner-controller.js.map