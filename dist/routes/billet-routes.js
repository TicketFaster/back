"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../utils/database");
const billet_entity_1 = require("../entities/billet-entity");
const reservation_entity_1 = require("../entities/reservation-entity");
const seance_entity_1 = require("../entities/seance-entity");
const middleware_auth_1 = require("../middleware/middleware-auth");
const router = express_1.default.Router();
/**
 * @route GET /api/billets
 * @desc Récupérer tous les billets
 * @access Protected
 */
router.get('/', middleware_auth_1.authMiddleware, async (req, res) => {
    try {
        const billetRepository = database_1.AppDataSource.getRepository(billet_entity_1.Billet);
        // Support des filtres
        const reservationId = req.query.reservation ? parseInt(req.query.reservation) : undefined;
        const seanceId = req.query.seance ? parseInt(req.query.seance) : undefined;
        const statut = req.query.statut;
        const typeTarif = req.query.typeTarif;
        // Construction de la requête avec les filtres
        let query = billetRepository.createQueryBuilder('billet')
            .leftJoinAndSelect('billet.reservation', 'reservation')
            .leftJoinAndSelect('billet.seance', 'seance')
            .leftJoinAndSelect('seance.evenement', 'evenement');
        if (reservationId) {
            query = query.where('billet.id_reservation = :reservationId', { reservationId });
        }
        if (seanceId) {
            query = query.andWhere('billet.id_seance = :seanceId', { seanceId });
        }
        if (statut) {
            query = query.andWhere('billet.statut = :statut', { statut });
        }
        if (typeTarif) {
            query = query.andWhere('billet.type_tarif = :typeTarif', { typeTarif });
        }
        // Exécution de la requête
        const billets = await query.orderBy('billet.id', 'DESC').getMany();
        return res.status(200).json(billets);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des billets:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
/**
 * @route GET /api/billets/:id
 * @desc Récupérer un billet par son ID
 * @access Protected
 */
router.get('/:id', middleware_auth_1.authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const billetRepository = database_1.AppDataSource.getRepository(billet_entity_1.Billet);
        const billet = await billetRepository.findOne({
            where: { id },
            relations: ['reservation', 'seance', 'seance.evenement', 'reservation.client']
        });
        if (!billet) {
            return res.status(404).json({ message: 'Billet non trouvé' });
        }
        return res.status(200).json(billet);
    }
    catch (error) {
        console.error('Erreur lors de la récupération du billet:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
/**
 * @route GET /api/billets/code/:codeBarre
 * @desc Récupérer un billet par son code-barre
 * @access Public - pour le scanner
 */
router.get('/code/:codeBarre', async (req, res) => {
    try {
        const codeBarre = req.params.codeBarre;
        const billetRepository = database_1.AppDataSource.getRepository(billet_entity_1.Billet);
        const billet = await billetRepository.findOne({
            where: { code_barre: codeBarre },
            relations: ['reservation', 'seance', 'seance.evenement', 'reservation.client']
        });
        if (!billet) {
            return res.status(404).json({ message: 'Billet non trouvé' });
        }
        return res.status(200).json(billet);
    }
    catch (error) {
        console.error('Erreur lors de la récupération du billet par code-barre:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
/**
 * @route POST /api/billets
 * @desc Créer un nouveau billet
 * @access Protected
 */
router.post('/', middleware_auth_1.authMiddleware, async (req, res) => {
    try {
        const { id_reservation, id_seance, type_tarif } = req.body;
        if (!id_reservation || !id_seance || !type_tarif) {
            return res.status(400).json({ message: 'Veuillez fournir toutes les informations nécessaires' });
        }
        // Vérifier si la réservation existe
        const reservationRepository = database_1.AppDataSource.getRepository(reservation_entity_1.Reservation);
        const reservation = await reservationRepository.findOneBy({ id: id_reservation });
        if (!reservation) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }
        // Vérifier si la séance existe et s'il reste des places
        const seanceRepository = database_1.AppDataSource.getRepository(seance_entity_1.Seance);
        const seance = await seanceRepository.findOne({
            where: { id: id_seance },
            relations: ['evenement']
        });
        if (!seance) {
            return res.status(404).json({ message: 'Séance non trouvée' });
        }
        if (seance.places_disponibles <= 0) {
            return res.status(400).json({ message: 'Plus de places disponibles pour cette séance' });
        }
        // Calculer le prix en fonction du type de tarif
        const prixBase = seance.evenement.prix_standard;
        const prixFinal = await database_1.AppDataSource.query('SELECT fn_CalculPrixReduit($1, $2) as prix', [prixBase, type_tarif]);
        const nouveauBillet = new billet_entity_1.Billet();
        nouveauBillet.id_reservation = id_reservation;
        nouveauBillet.id_seance = id_seance;
        nouveauBillet.type_tarif = type_tarif;
        nouveauBillet.prix_final = prixFinal[0].prix;
        nouveauBillet.statut = 'VALIDE';
        // Le code-barre sera généré automatiquement par le trigger
        const billetRepository = database_1.AppDataSource.getRepository(billet_entity_1.Billet);
        await billetRepository.save(nouveauBillet);
        // Mettre à jour le nombre de places disponibles
        seance.places_disponibles--;
        await seanceRepository.save(seance);
        return res.status(201).json(nouveauBillet);
    }
    catch (error) {
        console.error('Erreur lors de la création du billet:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
/**
 * @route PUT /api/billets/:id/statut
 * @desc Mettre à jour le statut d'un billet
 * @access Protected
 */
router.put('/:id/statut', middleware_auth_1.authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { statut } = req.body;
        if (!statut) {
            return res.status(400).json({ message: 'Veuillez fournir le statut' });
        }
        const billetRepository = database_1.AppDataSource.getRepository(billet_entity_1.Billet);
        const billet = await billetRepository.findOne({
            where: { id },
            relations: ['seance']
        });
        if (!billet) {
            return res.status(404).json({ message: 'Billet non trouvé' });
        }
        // Mettre à jour le statut du billet
        const oldStatut = billet.statut;
        billet.statut = statut;
        await billetRepository.save(billet);
        // Si le billet est annulé, remettre la place disponible
        if (oldStatut === 'VALIDE' && statut === 'ANNULE') {
            const seanceRepository = database_1.AppDataSource.getRepository(seance_entity_1.Seance);
            const seance = await seanceRepository.findOneBy({ id: billet.id_seance });
            if (seance) {
                seance.places_disponibles++;
                await seanceRepository.save(seance);
            }
        }
        // Si le billet était annulé et qu'on le revalide, réduire le nombre de places disponibles
        if (oldStatut === 'ANNULE' && statut === 'VALIDE') {
            const seanceRepository = database_1.AppDataSource.getRepository(seance_entity_1.Seance);
            const seance = await seanceRepository.findOneBy({ id: billet.id_seance });
            if (seance) {
                if (seance.places_disponibles <= 0) {
                    return res.status(400).json({ message: 'Plus de places disponibles pour cette séance' });
                }
                seance.places_disponibles--;
                await seanceRepository.save(seance);
            }
        }
        return res.status(200).json(billet);
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour du statut du billet:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
/**
 * @route DELETE /api/billets/:id
 * @desc Supprimer un billet
 * @access Protected
 */
router.delete('/:id', middleware_auth_1.authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const billetRepository = database_1.AppDataSource.getRepository(billet_entity_1.Billet);
        const billet = await billetRepository.findOne({
            where: { id },
            relations: ['seance']
        });
        if (!billet) {
            return res.status(404).json({ message: 'Billet non trouvé' });
        }
        // Si le billet est valide, libérer la place
        if (billet.statut === 'VALIDE') {
            const seanceRepository = database_1.AppDataSource.getRepository(seance_entity_1.Seance);
            const seance = await seanceRepository.findOneBy({ id: billet.id_seance });
            if (seance) {
                seance.places_disponibles++;
                await seanceRepository.save(seance);
            }
        }
        await billetRepository.remove(billet);
        return res.status(200).json({ message: 'Billet supprimé avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la suppression du billet:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
exports.default = router;
//# sourceMappingURL=billet-routes.js.map