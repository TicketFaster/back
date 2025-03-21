import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/auth/login
 * @desc Authentifie un utilisateur et renvoie un token JWT
 * @access Public
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @route POST /api/auth/register
 * @desc Enregistre un nouvel utilisateur
 * @access Public
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * @route POST /api/auth/refresh
 * @desc Rafraîchit le token JWT d'un utilisateur
 * @access Protected
 */
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

/**
 * @route GET /api/auth/me
 * @desc Récupère les informations de l'utilisateur actuel
 * @access Protected
 */
router.get('/me', (req, res) => authController.getCurrentUser(req, res));

export default router;