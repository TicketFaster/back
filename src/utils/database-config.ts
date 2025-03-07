import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Evenement } from '../entities/evenement.entity';
import { Salle } from '../entities/salle.entity';
import { Seance } from '../entities/seance.entity';
import { Client } from '../entities/client.entity';
import { Reservation } from '../entities/reservation.entity';
import { Billet } from '../entities/billet.entity';
import { HistoriqueReservation } from '../entities/historique-reservation.entity';
import { logger } from './logger';

// Charger les variables d'environnement
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'billetterie',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [Evenement, Salle, Seance, Client, Reservation, Billet, HistoriqueReservation],
  subscribers: [],
  migrations: []
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('Base de données connectée');
  } catch (error) {
    logger.error('Erreur lors de la connexion à la base de données', error);
    process.exit(1);
  }
};
