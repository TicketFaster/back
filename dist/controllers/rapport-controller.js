"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapportController = void 0;
const rapport_service_1 = require("../services/rapport-service");
const logger_utility_1 = require("../utils/logger-utility");
class RapportController {
    constructor() {
        this.rapportService = new rapport_service_1.RapportService();
    }
    /**
     * Génère un rapport de ventes pour une période donnée
     */
    async genererRapportVentes(req, res) {
        try {
            const { date_debut, date_fin } = req.query;
            if (!date_debut || !date_fin) {
                res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
                return;
            }
            const dateDebut = new Date(date_debut);
            const dateFin = new Date(date_fin);
            const rapport = await this.rapportService.generateRapportVentes(dateDebut, dateFin);
            res.status(200).json(rapport);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la génération du rapport de ventes', error);
            res.status(500).json({ message: 'Erreur lors de la génération du rapport de ventes' });
        }
    }
    /**
     * Calcule le taux de remplissage pour une séance
     */
    async getTauxRemplissage(req, res) {
        try {
            const seanceId = parseInt(req.params.seanceId);
            const taux = await this.rapportService.getTauxRemplissage(seanceId);
            res.status(200).json({ taux });
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors du calcul du taux de remplissage pour la séance ${req.params.seanceId}`, error);
            res.status(500).json({ message: 'Erreur lors du calcul du taux de remplissage' });
        }
    }
    /**
     * Génère un rapport de ventes par catégorie d'événement
     */
    async getVentesParCategorie(req, res) {
        try {
            const { date_debut, date_fin } = req.query;
            if (!date_debut || !date_fin) {
                res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
                return;
            }
            const dateDebut = new Date(date_debut);
            const dateFin = new Date(date_fin);
            const rapport = await this.rapportService.getVentesParCategorie(dateDebut, dateFin);
            res.status(200).json(rapport);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la génération du rapport de ventes par catégorie', error);
            res.status(500).json({ message: 'Erreur lors de la génération du rapport de ventes par catégorie' });
        }
    }
    /**
     * Génère un rapport des meilleures ventes d'événements
     */
    async getMeilleuresVentes(req, res) {
        try {
            const { date_debut, date_fin, limit } = req.query;
            if (!date_debut || !date_fin) {
                res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
                return;
            }
            const dateDebut = new Date(date_debut);
            const dateFin = new Date(date_fin);
            const limitCount = limit ? parseInt(limit) : 10;
            const rapport = await this.rapportService.getMeilleuresVentes(dateDebut, dateFin, limitCount);
            res.status(200).json(rapport);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la génération du rapport des meilleures ventes', error);
            res.status(500).json({ message: 'Erreur lors de la génération du rapport des meilleures ventes' });
        }
    }
    /**
     * Génère un rapport de fréquentation par tranche horaire
     */
    async getFrequentationParHoraire(req, res) {
        try {
            const { date_debut, date_fin } = req.query;
            if (!date_debut || !date_fin) {
                res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
                return;
            }
            const dateDebut = new Date(date_debut);
            const dateFin = new Date(date_fin);
            const rapport = await this.rapportService.getFrequentationParHoraire(dateDebut, dateFin);
            res.status(200).json(rapport);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la génération du rapport de fréquentation par horaire', error);
            res.status(500).json({ message: 'Erreur lors de la génération du rapport de fréquentation par horaire' });
        }
    }
    /**
     * Génère un rapport sur les types de tarifs les plus utilisés
     */
    async getStatistiquesTarifs(req, res) {
        try {
            const { date_debut, date_fin } = req.query;
            if (!date_debut || !date_fin) {
                res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
                return;
            }
            const dateDebut = new Date(date_debut);
            const dateFin = new Date(date_fin);
            const statistiques = await this.rapportService.getStatistiquesTarifs(dateDebut, dateFin);
            res.status(200).json(statistiques);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la génération des statistiques de tarifs', error);
            res.status(500).json({ message: 'Erreur lors de la génération des statistiques de tarifs' });
        }
    }
    /**
     * Obtient les statistiques globales pour le tableau de bord
     */
    async getStatistiquesGlobales(req, res) {
        try {
            const stats = await this.rapportService.getStatistiquesGlobales();
            res.status(200).json(stats);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la récupération des statistiques globales', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des statistiques globales' });
        }
    }
    /**
     * Récupère les statistiques d'un client
     */
    async getStatistiquesClient(req, res) {
        try {
            const clientId = parseInt(req.params.clientId);
            // Cette méthode n'est pas implémentée dans le service, mais pourrait être utilisée
            // pour appeler une fonction SQL 'fn_StatistiquesClient'
            res.status(501).json({ message: 'Fonctionnalité non implémentée' });
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération des statistiques du client ${req.params.clientId}`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération des statistiques du client' });
        }
    }
    /**
     * Récupère les disponibilités sur une période pour un événement
     */
    async getDisponibilitesPeriode(req, res) {
        try {
            const evenementId = parseInt(req.params.evenementId);
            const { date_debut, date_fin, nb_places_min } = req.query;
            if (!date_debut || !date_fin) {
                res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
                return;
            }
            const dateDebut = new Date(date_debut);
            const dateFin = new Date(date_fin);
            const nbPlacesMin = nb_places_min ? parseInt(nb_places_min) : 1;
            // Cette méthode n'est pas implémentée dans le service, mais pourrait être utilisée
            // pour appeler une fonction SQL 'fn_DisponibilitesPeriode'
            res.status(501).json({ message: 'Fonctionnalité non implémentée' });
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la récupération des disponibilités', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des disponibilités' });
        }
    }
    /**
     * Calcule un prix réduit en fonction du type de tarif
     */
    async calculerPrixReduit(req, res) {
        try {
            const { prix_base, type_tarif } = req.body;
            if (prix_base === undefined || !type_tarif) {
                res.status(400).json({ message: 'Le prix de base et le type de tarif sont requis' });
                return;
            }
            const prixBase = parseFloat(prix_base);
            // Cette méthode n'est pas implémentée dans le service, mais pourrait être utilisée
            // pour appeler une fonction SQL 'fn_CalculPrixReduit'
            res.status(501).json({ message: 'Fonctionnalité non implémentée' });
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors du calcul du prix réduit', error);
            res.status(500).json({ message: 'Erreur lors du calcul du prix réduit' });
        }
    }
}
exports.RapportController = RapportController;
//# sourceMappingURL=rapport-controller.js.map