"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../utils/database");
const salle_entity_1 = require("../entities/salle-entity");
const middleware_auth_1 = require("../middleware/middleware-auth");
const router = express_1.default.Router();
/**
 * @route GET /api/salles
 * @desc Récupérer toutes les salles
 * @access Public
 */
router.get('/', async (req, res) => {
    try {
        const salleRepository = database_1.AppDataSource.getRepository(salle_entity_1.Salle);
        const salles = await salleRepository.find();
        return res.status(200).json(salles);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des salles:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
/**
 * @route GET /api/salles/:id
 * @desc Récupérer une salle par son ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const salleRepository = database_1.AppDataSource.getRepository(salle_entity_1.Salle);
        const salle = await salleRepository.findOne({
            where: { id },
            relations: ['seances']
        });
        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }
        return res.status(200).json(salle);
    }
    catch (error) {
        console.error('Erreur lors de la récupération de la salle:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
/**
 * @route POST /api/salles
 * @desc Créer une nouvelle salle
 * @access Protected
 */
router.post('/', middleware_auth_1.authMiddleware, async (req, res) => {
    try {
        const { nom, capacite, configuration } = req.body;
        if (!nom || !capacite || !configuration) {
            return res.status(400).json({ message: 'Veuillez fournir toutes les informations nécessaires' });
        }
        const salleRepository = database_1.AppDataSource.getRepository(salle_entity_1.Salle);
        const nouvelleSalle = new salle_entity_1.Salle();
        nouvelleSalle.nom = nom;
        nouvelleSalle.capacite = capacite;
        nouvelleSalle.configuration = configuration;
        await salleRepository.save(nouvelleSalle);
        return res.status(201).json(nouvelleSalle);
    }
    catch (error) {
        console.error('Erreur lors de la création de la salle:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
/**
 * @route PUT /api/salles/:id
 * @desc Mettre à jour une salle
 * @access Protected
 */
router.put('/:id', middleware_auth_1.authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nom, capacite, configuration } = req.body;
        const salleRepository = database_1.AppDataSource.getRepository(salle_entity_1.Salle);
        const salle = await salleRepository.findOneBy({ id });
        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }
        if (nom)
            salle.nom = nom;
        if (capacite)
            salle.capacite = capacite;
        if (configuration)
            salle.configuration = configuration;
        await salleRepository.save(salle);
        return res.status(200).json(salle);
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de la salle:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
/**
 * @route DELETE /api/salles/:id
 * @desc Supprimer une salle
 * @access Protected
 */
router.delete('/:id', middleware_auth_1.authMiddleware, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const salleRepository = database_1.AppDataSource.getRepository(salle_entity_1.Salle);
        const salle = await salleRepository.findOneBy({ id });
        if (!salle) {
            return res.status(404).json({ message: 'Salle non trouvée' });
        }
        await salleRepository.remove(salle);
        return res.status(200).json({ message: 'Salle supprimée avec succès' });
    }
    catch (error) {
        console.error('Erreur lors de la suppression de la salle:', error);
        return res.status(500).json({ message: 'Erreur serveur' });
    }
});
exports.default = router;
//# sourceMappingURL=salle-routes.js.map