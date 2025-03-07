"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapportController = void 0;
const services_1 = require("../services/");
const logger_utility_1 = require("../utils/logger-utility");
class RapportController {
    constructor() {
        this.rapportService = new services_1.RapportService();
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
            const rapport = await this.rapportService.genererRapportVentes(dateDebut, dateFin);
            res.status(200).json(rapport);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la génération du rapport de ventes', error);
            res.status(500).json({ message: 'Erreur lors de la génération du rapport de ventes' });
        }
    }
    /**
     * Récupère les statistiques d'un client
     */
    async getStatistiquesClient(req, res) {
        try {
            const clientId = parseInt(req.params.clientId);
            const stats = await this.rapportService.getStatistiquesClient(clientId);
            if (stats) {
                res.status(200).json(stats);
            }
            else {
                res.status(404).json({ message: 'Client non trouvé ou aucune statistique disponible' });
            }
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
            const disponibilites = await this.rapportService.getDisponibilitesPeriode(evenementId, dateDebut, dateFin, nbPlacesMin);
            res.status(200).json(disponibilites);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la récupération des disponibilités', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des disponibilités' });
        }
    }
    /**
     * Récupère le taux de remplissage d'une séance
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
            const prixReduit = await this.rapportService.calculerPrixReduit(prixBase, type_tarif);
            res.status(200).json({ prix_base: prixBase, type_tarif, prix_reduit: prixReduit });
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors du calcul du prix réduit', error);
            res.status(500).json({ message: 'Erreur lors du calcul du prix réduit' });
        }
    }
    /**
     * Génère un rapport des ventes par catégorie d'événement
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
            logger_utility_1.logger.error('Erreur lors de la génération du rapport des ventes par catégorie', error);
            res.status(500).json({ message: 'Erreur lors de la génération du rapport des ventes par catégorie' });
        }
    }
    /**
     * Génère un rapport des ventes par mois
     */
    async getVentesParMois(req, res) {
        try {
            const annee = parseInt(req.params.annee || new Date().getFullYear().toString());
            const rapport = await this.rapportService.getVentesParMois(annee);
            res.status(200).json(rapport);
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la génération du rapport des ventes par mois pour l'année ${req.params.annee}`, error);
            res.status(500).json({ message: 'Erreur lors de la génération du rapport des ventes par mois' });
        }
    }
    /**
     * Génère un rapport sur les types de tarifs vendus
     */
    async getVentesParTypeTarif(req, res) {
        try {
            const { date_debut, date_fin } = req.query;
            if (!date_debut || !date_fin) {
                res.status(400).json({ message: 'Les dates de début et de fin sont requises' });
                return;
            }
            const dateDebut = new Date(date_debut);
            const dateFin = new Date(date_fin);
            const rapport = await this.rapportService.getVentesParTypeTarif(dateDebut, dateFin);
            res.status(200).json(rapport);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la génération du rapport des ventes par type de tarif', error);
            res.status(500).json({ message: 'Erreur lors de la génération du rapport des ventes par type de tarif' });
        }
    }
}
exports.RapportController = RapportController;
//# sourceMappingURL=rapport-controller.js.map