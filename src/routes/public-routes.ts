import express from 'express';
import { Request, Response } from 'express';
import { AppDataSource } from '../utils/database';
import { Client } from '../entities/client-entity';

const router = express.Router();

/**
 * @route GET /api/public/clients
 * @desc Récupérer tous les clients sans authentification
 * @access Public
 */
router.get('/clients', async (req: Request, res: Response) => {
    try {
        // Accès direct à la base de données avec une requête SQL
        const clients = await AppDataSource.query('SELECT * FROM client');
        return res.status(200).json(clients);
    } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        // @ts-ignore
        return res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});

/**
 * @route GET /api/public/test
 * @desc Simple test pour vérifier que l'API fonctionne
 * @access Public
 */
router.get('/test', (req: Request, res: Response) => {
    return res.status(200).json({ message: 'API accessible sans authentification' });
});

export default router;