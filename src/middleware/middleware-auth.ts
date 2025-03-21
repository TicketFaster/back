import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger-utility';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le token
    const secretKey = process.env.JWT_SECRET || 'billetterie-default-secret';
    const decoded = jwt.verify(token, secretKey);

    // Ajouter les informations de l'utilisateur à la requête
    (req as any).user = decoded;

    next();
  } catch (error) {
    logger.error('Erreur d\'authentification', error);

    if ((error as any).name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expirée, veuillez vous reconnecter' });
    }

    return res.status(401).json({ message: 'Authentification invalide' });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si l'utilisateur est un administrateur
  if ((req as any).user && (req as any).user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
};
