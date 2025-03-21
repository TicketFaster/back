import "reflect-metadata";
import { DataSource } from "typeorm";
import { Client } from '../entities/client-entity';
import { Reservation } from '../entities/reservation-entity';
import { Billet } from '../entities/billet-entity';
import { Seance } from '../entities/seance-entity';
import { Evenement } from '../entities/evenement-entity';
import { Salle } from '../entities/salle-entity';
import { User } from '../entities/user-entity';  // Vérifiez que ce chemin est correct
import { HistoriqueReservation } from '../entities/historique-reservation-entity';
import dotenv from 'dotenv';
import { logger } from './logger-utility';

// Charger les variables d'environnement
dotenv.config();

// Si les entités ne sont pas trouvées correctement, essayez avec cette approche alternative
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "billetterie",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [
    // Spécifier le chemin plutôt que d'utiliser les références d'importation
    // Cette approche est plus robuste pour trouver les métadonnées
    __dirname + '/../entities/*.js'
  ],
  subscribers: [],
  migrations: []
});