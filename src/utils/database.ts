import "reflect-metadata";
import { DataSource } from "typeorm";
import { Evenement } from '../entities/evenement-entity';
import { Salle } from '../entities/salle-entity';
import { Seance } from '../entities/seance-entity';
import { Client } from '../entities/client-entity';
import { Reservation } from '../entities/reservation-entity';
import { Billet } from '../entities/billet-entity';
import { HistoriqueReservation } from '../entities/historique-reservation-entity';
import { User } from '../entities/user-entity';
import { logger } from './logger';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "billetterie",
  synchronize: process.env.NODE_ENV === "development", // Ne pas utiliser en production
  logging: process.env.NODE_ENV === "development",
  entities: [
    Evenement,
    Salle,
    Seance,
    Client,
    Reservation,
    Billet,
    HistoriqueReservation,
    User
  ],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
  connectTimeoutMS: 10000,
  maxQueryExecutionTime: 5000 // Journaliser les requêtes qui prennent plus de 5s
});

// Fonction pour initialiser la connexion à la base de données
export const initDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info("Connexion à la base de données établie");
  } catch (error) {
    logger.error(`Erreur lors de la connexion à la base de données: ${error}`);
    throw error;
  }
};
