import 'reflect-metadata';
import app from './app-setup';
import { initializeDatabase } from './utils/database-config';
import { logger } from './utils/logger-utility';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Initialiser la connexion à la base de données
    await initializeDatabase();

    // Démarrer le serveur
    app.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur', error);
    process.exit(1);
  }
};

startServer();
