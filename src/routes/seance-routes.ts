import express from 'express';
import { Request, Response } from 'express';
import { AppDataSource } from '../utils/database';
import { Seance } from '../entities/seance-entity';
import { Evenement } from '../entities/evenement-entity';
import { Salle } from '../entities/salle-entity';
import { authMiddleware } from '../middleware/middleware-auth';

const router = express.Router();

/**
 * @route GET /api/seances
 * @desc Récupérer toutes les séances
 * @access Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const seanceRepository = AppDataSource.getRepository(Seance);
    
    // Support des filtres de recherche
    const evenementId = req.query.evenement ? parseInt(req.query.evenement as string) : undefined;
    const salleId = req.query.salle ? parseInt(req.query.salle as string) : undefined;
    const dateMin = req.query.dateMin ? new Date(req.query.dateMin as string) : undefined;
    const dateMax = req.query.dateMax ? new Date(req.query.dateMax as string) : undefined;
    
    // Construction de la requête avec les filtres
    let query = seanceRepository.createQueryBuilder('seance')
      .leftJoinAndSelect('seance.evenement', 'evenement')
      .leftJoinAndSelect('seance.salle', 'salle');
    
    if (evenementId) {
      query = query.where('seance.id_evenement = :evenementId', { evenementId });
    }
    
    if (salleId) {
      query = query.andWhere('seance.salle_id = :salleId', { salleId });
    }
    
    if (dateMin) {
      query = query.andWhere('seance.date_heure >= :dateMin', { dateMin });
    }
    
    if (dateMax) {
      query = query.andWhere('seance.date_heure <= :dateMax', { dateMax });
    }
    
    // Exécution de la requête
    const seances = await query.orderBy('seance.date_heure', 'ASC').getMany();
    
    return res.status(200).json(seances);
  } catch (error) {
    console.error('Erreur lors de la récupération des séances:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route GET /api/seances/:id
 * @desc Récupérer une séance par son ID
 * @access Public
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const seanceRepository = AppDataSource.getRepository(Seance);
    
    const seance = await seanceRepository.findOne({
      where: { id },
      relations: ['evenement', 'salle', 'billets']
    });
    
    if (!seance) {
      return res.status(404).json({ message: 'Séance non trouvée' });
    }
    
    return res.status(200).json(seance);
  } catch (error) {
    console.error('Erreur lors de la récupération de la séance:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route POST /api/seances
 * @desc Créer une nouvelle séance
 * @access Protected
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id_evenement, date_heure, salle_id, places_disponibles } = req.body;
    
    if (!id_evenement || !date_heure || !salle_id) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations nécessaires' });
    }
    
    // Vérification que l'événement existe
    const evenementRepository = AppDataSource.getRepository(Evenement);
    const evenement = await evenementRepository.findOneBy({ id: id_evenement });
    
    if (!evenement) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    
    // Vérification que la salle existe
    const salleRepository = AppDataSource.getRepository(Salle);
    const salle = await salleRepository.findOneBy({ id: salle_id });
    
    if (!salle) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }
    
    const seanceRepository = AppDataSource.getRepository(Seance);
    
    // Vérification du chevauchement des séances
    const dateSeance = new Date(date_heure);
    
    // Création de la nouvelle séance
    const nouvelleSeance = new Seance();
    nouvelleSeance.id_evenement = id_evenement;
    nouvelleSeance.date_heure = dateSeance;
    nouvelleSeance.salle_id = salle_id;
    nouvelleSeance.places_disponibles = places_disponibles || salle.capacite;
    
    await seanceRepository.save(nouvelleSeance);
    
    return res.status(201).json(nouvelleSeance);
  } catch (error) {
    console.error('Erreur lors de la création de la séance:', error);
    
    // Si l'erreur est liée au trigger de validation de date
    if (error instanceof Error && error.message.includes('Conflit d\'horaire')) {
      return res.status(400).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route PUT /api/seances/:id
 * @desc Mettre à jour une séance
 * @access Protected
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { id_evenement, date_heure, salle_id, places_disponibles } = req.body;
    
    const seanceRepository = AppDataSource.getRepository(Seance);
    const seance = await seanceRepository.findOneBy({ id });
    
    if (!seance) {
      return res.status(404).json({ message: 'Séance non trouvée' });
    }
    
    if (id_evenement) seance.id_evenement = id_evenement;
    if (date_heure) seance.date_heure = new Date(date_heure);
    if (salle_id) seance.salle_id = salle_id;
    if (places_disponibles !== undefined) seance.places_disponibles = places_disponibles;
    
    await seanceRepository.save(seance);
    
    return res.status(200).json(seance);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la séance:', error);
    
    // Si l'erreur est liée au trigger de validation de date
    if (error instanceof Error && error.message.includes('Conflit d\'horaire')) {
      return res.status(400).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route DELETE /api/seances/:id
 * @desc Supprimer une séance
 * @access Protected
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const seanceRepository = AppDataSource.getRepository(Seance);
    
    // Vérifier si la séance a des billets
    const seance = await seanceRepository.findOne({
      where: { id },
      relations: ['billets']
    });
    
    if (!seance) {
      return res.status(404).json({ message: 'Séance non trouvée' });
    }
    
    if (seance.billets && seance.billets.length > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer cette séance car des billets y sont associés' 
      });
    }
    
    await seanceRepository.remove(seance);
    
    return res.status(200).json({ message: 'Séance supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la séance:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;