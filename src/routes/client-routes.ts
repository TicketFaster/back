import express from 'express';
import { Request, Response } from 'express';
import { AppDataSource } from '../utils/database';
import { Client } from '../entities/client-entity';
import { authMiddleware } from '../middleware/middleware-auth';

const router = express.Router();

/**
 * @route GET /api/clients
 * @desc Récupérer tous les clients
 * @access Protected
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    
    // Support de recherche par nom/email
    const searchQuery = req.query.search as string;
    
    if (searchQuery) {
      const clients = await clientRepository.createQueryBuilder('client')
        .where('client.nom ILIKE :search', { search: `%${searchQuery}%` })
        .orWhere('client.prenom ILIKE :search', { search: `%${searchQuery}%` })
        .orWhere('client.email ILIKE :search', { search: `%${searchQuery}%` })
        .orderBy('client.nom', 'ASC')
        .getMany();
      
      return res.status(200).json(clients);
    }
    
    // Sans recherche, renvoyer tous les clients
    const clients = await clientRepository.find({
      order: { nom: 'ASC' }
    });
    
    return res.status(200).json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route GET /api/clients/:id
 * @desc Récupérer un client par son ID
 * @access Protected
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const clientRepository = AppDataSource.getRepository(Client);
    
    const client = await clientRepository.findOne({
      where: { id },
      relations: ['reservations']
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    return res.status(200).json(client);
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route GET /api/clients/:id/statistiques
 * @desc Récupérer les statistiques d'un client
 * @access Protected
 */
router.get('/:id/statistiques', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Utilisation de la fonction SQL pour obtenir les statistiques du client
    const stats = await AppDataSource.query('SELECT * FROM fn_StatistiquesClient($1)', [id]);
    
    if (!stats || stats.length === 0) {
      return res.status(404).json({ message: 'Client non trouvé ou pas de statistiques disponibles' });
    }
    
    return res.status(200).json(stats[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du client:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route POST /api/clients
 * @desc Créer un nouveau client
 * @access Protected
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { nom, prenom, email, telephone } = req.body;
    
    if (!nom || !prenom || !email) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations nécessaires' });
    }
    
    const clientRepository = AppDataSource.getRepository(Client);
    
    // Vérifier si un client existe déjà avec cet email
    const clientExistant = await clientRepository.findOneBy({ email });
    
    if (clientExistant) {
      return res.status(400).json({ message: 'Un client avec cet email existe déjà' });
    }
    
    const nouveauClient = new Client();
    nouveauClient.nom = nom;
    nouveauClient.prenom = prenom;
    nouveauClient.email = email;
    nouveauClient.telephone = telephone || '';
    
    await clientRepository.save(nouveauClient);
    
    return res.status(201).json(nouveauClient);
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route PUT /api/clients/:id
 * @desc Mettre à jour un client
 * @access Protected
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { nom, prenom, email, telephone } = req.body;
    
    const clientRepository = AppDataSource.getRepository(Client);
    const client = await clientRepository.findOneBy({ id });
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre client
    if (email && email !== client.email) {
      const clientExistant = await clientRepository.findOneBy({ email });
      
      if (clientExistant && clientExistant.id !== id) {
        return res.status(400).json({ message: 'Un autre client utilise déjà cet email' });
      }
    }
    
    if (nom) client.nom = nom;
    if (prenom) client.prenom = prenom;
    if (email) client.email = email;
    if (telephone !== undefined) client.telephone = telephone;
    
    await clientRepository.save(client);
    
    return res.status(200).json(client);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route DELETE /api/clients/:id
 * @desc Supprimer un client
 * @access Protected
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const clientRepository = AppDataSource.getRepository(Client);
    
    // Vérifier si le client a des réservations
    const client = await clientRepository.findOne({
      where: { id },
      relations: ['reservations']
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    
    if (client.reservations && client.reservations.length > 0) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer ce client car il possède des réservations' 
      });
    }
    
    await clientRepository.remove(client);
    
    return res.status(200).json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @route GET /api/clients/public
 * @desc Récupérer tous les clients (sans authentification)
 * @access Public
 */
router.get('/public', async (req: Request, res: Response) => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const clients = await clientRepository.find({
      order: { nom: 'ASC' }
    });

    return res.status(200).json(clients);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;