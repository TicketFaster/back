import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from './logger-utility';

dotenv.config();

// Configuration avec logging complet
console.log('Tentative de connexion à la base de données avec les paramètres:');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port: ${process.env.DB_PORT || '5433'}`);
console.log(`User: ${process.env.DB_USERNAME || 'postgres'}`);
console.log(`Database: ${process.env.DB_NAME || 'billetterie'}`);

// Connexion avec paramètres explicites et authentification trust
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'billetterie'
});

// Fonction d'initialisation
export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    logger.info('Connexion à la base de données PostgreSQL établie avec succès');
    client.release();
    return pool;
  } catch (err: any) {
    logger.error(`Erreur lors de la connexion à la base de données ${err.message}`);
    console.error('Détails de l\'erreur:', err);
    throw err;
  }
};

export default pool;