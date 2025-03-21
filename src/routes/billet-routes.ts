import express from 'express';
import { Request, Response } from 'express';
import { AppDataSource } from '../utils/database';
import { Billet } from '../entities/billet-entity';
import { Reservation } from '../entities/reservation-entity';
import { Seance } from '../entities/seance-entity';
import { authMiddleware } from '../middleware/middleware-auth';

const router = express.Router();

/**
 * @route GET /api/billets
 * @desc Récupérer tous les billets
 * @access Protected
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const billetRepository = AppDataSource.getRepository(Billet);
    
    // Support des filtres
    const reservationId = req.query.reservation ? parseInt(req.query.reservation as string) : undefined;
    const seanceId = req.query.seance ? parseInt(req.query.seance as string) : undefined;
    const statut = req.query.statut as string;
    const typeTarif = req.query.typeTarif as string;
    
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
  } catch (error) {
    console.error('Erreur lors de la récupération des billets:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route GET /api/billets/:id
 * @desc Récupérer un billet par son ID
 * @access Protected
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const billetRepository = AppDataSource.getRepository(Billet);
    
    const billet = await billetRepository.findOne({
      where: { id },
      relations: ['reservation', 'seance', 'seance.evenement', 'reservation.client']
    });
    
    if (!billet) {
      return res.status(404).json({ message: 'Billet non trouvé' });
    }
    
    return res.status(200).json(billet);
  } catch (error) {
    console.error('Erreur lors de la récupération du billet:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route GET /api/billets/code/:codeBarre
 * @desc Récupérer un billet par son code-barre
 * @access Public - pour le scanner
 */
router.get('/code/:codeBarre', async (req: Request, res: Response) => {
  try {
    const codeBarre = req.params.codeBarre;
    const billetRepository = AppDataSource.getRepository(Billet);
    
    const billet = await billetRepository.findOne({
      where: { code_barre: codeBarre },
      relations: ['reservation', 'seance', 'seance.evenement', 'reservation.client']
    });
    
    if (!billet) {
      return res.status(404).json({ message: 'Billet non trouvé' });
    }
    
    return res.status(200).json(billet);
  } catch (error) {
    console.error('Erreur lors de la récupération du billet par code-barre:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route POST /api/billets
 * @desc Créer un nouveau billet
 * @access Protected
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id_reservation, id_seance, type_tarif } = req.body;
    
    if (!id_reservation || !id_seance || !type_tarif) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations nécessaires' });
    }
    
    // Vérifier si la réservation existe
    const reservationRepository = AppDataSource.getRepository(Reservation);
    const reservation = await reservationRepository.findOneBy({ id: id_reservation });
    
    if (!reservation) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }
    
    // Vérifier si la séance existe et s'il reste des places
    const seanceRepository = AppDataSource.getRepository(Seance);
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
    const prixFinal = await AppDataSource.query(
      'SELECT fn_CalculPrixReduit($1, $2) as prix', 
      [prixBase, type_tarif]
    );
    
    const nouveauBillet = new Billet();
    nouveauBillet.id_reservation = id_reservation;
    nouveauBillet.id_seance = id_seance;
    nouveauBillet.type_tarif = type_tarif;
    nouveauBillet.prix_final = prixFinal[0].prix;
    nouveauBillet.statut = 'VALIDE';
    
    // Le code-barre sera généré automatiquement par le trigger
    
    const billetRepository = AppDataSource.getRepository(Billet);
    await billetRepository.save(nouveauBillet);
    
    // Mettre à jour le nombre de places disponibles
    seance.places_disponibles--;
    await seanceRepository.save(seance);
    
    return res.status(201).json(nouveauBillet);
  } catch (error) {
    console.error('Erreur lors de la création du billet:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route PUT /api/billets/:id/statut
 * @desc Mettre à jour le statut d'un billet
 * @access Protected
 */
router.put('/:id/statut', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { statut } = req.body;
    
    if (!statut) {
      return res.status(400).json({ message: 'Veuillez fournir le statut' });
    }
    
    const billetRepository = AppDataSource.getRepository(Billet);
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
      const seanceRepository = AppDataSource.getRepository(Seance);
      const seance = await seanceRepository.findOneBy({ id: billet.id_seance });
      
      if (seance) {
        seance.places_disponibles++;
        await seanceRepository.save(seance);
      }
    }
    
    // Si le billet était annulé et qu'on le revalide, réduire le nombre de places disponibles
    if (oldStatut === 'ANNULE' && statut === 'VALIDE') {
      const seanceRepository = AppDataSource.getRepository(Seance);
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
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut du billet:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route DELETE /api/billets/:id
 * @desc Supprimer un billet
 * @access Protected
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const billetRepository = AppDataSource.getRepository(Billet);
    
    const billet = await billetRepository.findOne({
      where: { id },
      relations: ['seance']
    });
    
    if (!billet) {
      return res.status(404).json({ message: 'Billet non trouvé' });
    }
    
    // Si le billet est valide, libérer la place
    if (billet.statut === 'VALIDE') {
      const seanceRepository = AppDataSource.getRepository(Seance);
      const seance = await seanceRepository.findOneBy({ id: billet.id_seance });
      
      if (seance) {
        seance.places_disponibles++;
        await seanceRepository.save(seance);
      }
    }
    
    await billetRepository.remove(billet);
    
    return res.status(200).json({ message: 'Billet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du billet:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;