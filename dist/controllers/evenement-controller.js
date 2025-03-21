"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvenementController = void 0;
const evenement_service_1 = require("../services/evenement-service");
const logger_utility_1 = require("../utils/logger-utility");
class EvenementController {
    constructor() {
        this.evenementService = new evenement_service_1.EvenementService();
    }
    /**
     * Récupère tous les événements
     */
    async getAllEvenements(req, res) {
        try {
            const evenements = await this.evenementService.findAll();
            res.status(200).json(evenements);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la récupération des événements', error);
            res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
        }
    }
    /**
     * Récupère un événement par son ID
     */
    async getEvenementById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const evenement = await this.evenementService.findOne(id);
            if (evenement) {
                res.status(200).json(evenement);
            }
            else {
                res.status(404).json({ message: 'Événement non trouvé' });
            }
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération de l'événement ${req.params.id}`, error);
            res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement' });
        }
    }
    /**
     * Crée un nouvel événement
     */
    async createEvenement(req, res) {
        try {
            const evenementData = req.body;
            // Validation de base
            if (!evenementData.titre || !evenementData.categorie || !evenementData.duree || !evenementData.prix_standard) {
                res.status(400).json({ message: 'Données événement incomplètes' });
                return;
            }
            const newEvenement = await this.evenementService.create(evenementData);
            res.status(201).json(newEvenement);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la création d\'un événement', error);
            res.status(500).json({ message: 'Erreur lors de la création de l\'événement' });
        }
    }
    /**
     * Met à jour un événement existant
     */
    async updateEvenement(req, res) {
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
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la mise à jour de l'événement ${req.params.id}`, error);
            res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
        }
    }
    /**
     * Supprime un événement
     */
    async deleteEvenement(req, res) {
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
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la suppression de l'événement ${req.params.id}`, error);
            res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement' });
        }
    }
    /**
     * Recherche des événements par critères
     */
    async searchEvenements(req, res) {
        try {
            const { titre, categorie, dateDebut, dateFin } = req.query;
            // Créer l'objet de filtres
            const filtres = {};
            if (titre)
                filtres.titre = titre;
            if (categorie)
                filtres.categorie = categorie;
            if (dateDebut)
                filtres.dateDebut = new Date(dateDebut);
            if (dateFin)
                filtres.dateFin = new Date(dateFin);
            // Pour cet endpoint, j'imagine une méthode de recherche qui n'existe pas 
            // dans le service actuel mais qui pourrait être implémentée
            const evenements = await this.evenementService.findAll();
            // Filtrage côté client (normalement, ce serait fait dans le service ou la base de données)
            let resultats = evenements;
            if (titre) {
                resultats = resultats.filter(ev => ev.titre.toLowerCase().includes(titre.toLowerCase()));
            }
            if (categorie) {
                resultats = resultats.filter(ev => ev.categorie === categorie);
            }
            res.status(200).json(resultats);
        }
        catch (error) {
            logger_utility_1.logger.error('Erreur lors de la recherche d\'événements', error);
            res.status(500).json({ message: 'Erreur lors de la recherche d\'événements' });
        }
    }
}
exports.EvenementController = EvenementController;
//# sourceMappingURL=evenement-controller.js.map