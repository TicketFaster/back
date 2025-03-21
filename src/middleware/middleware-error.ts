import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger-utility';

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Journaliser l'erreur
  logger.error(`Erreur non gérée: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Déterminer le code d'état HTTP approprié
  let statusCode = 500;
  let errorMessage = 'Une erreur serveur est survenue';

  if ((err as any).statusCode) {
    statusCode = (err as any).statusCode;
  }

  if (err.message && process.env.NODE_ENV !== 'production') {
    errorMessage = err.message;
  }

  // Répondre au client
  res.status(statusCode).json({
    error: true,
    message: errorMessage,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Middleware pour gérer les routes qui n'existent pas
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  (error as any).statusCode = 404;
  next(error);
};
