import { Router } from 'express';
import { ScannerController } from '../controllers/scanner-controller';
import { authMiddleware } from '../middleware/middleware-auth';

const router = Router();
const scannerController = new ScannerController();

// Vérifier l'authenticité d'un billet par son code-barres
router.post('/validate', authMiddleware, (req, res) => scannerController.validateBillet(req, res));

// Marquer un billet comme utilisé
router.post('/mark-used/:id', authMiddleware, (req, res) => scannerController.markBilletAsUsed(req, res));

// Récupérer les statistiques d'utilisation
router.get('/stats', authMiddleware, (req, res) => scannerController.getUsageStatistics(req, res));

export default router;
