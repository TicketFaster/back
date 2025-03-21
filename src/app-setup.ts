import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth-routes';
import evenementRoutes from './routes/evenement.routes';
import salleRoutes from './routes/salle-routes';
import seanceRoutes from './routes/seance-routes';
import clientRoutes from './routes/client-routes';
import reservationRoutes from './routes/reservation-routes';
import billetRoutes from './routes/billet-routes';
import rapportRoutes from './routes/rapport-routes';
import scannerRoutes from './routes/scanner-routes';

// Middleware
import { errorMiddleware, notFoundMiddleware } from './middleware/middleware-error';

// Utilities
import { logger } from './utils/logger-utility';
import publicRoutes from "./routes/public-routes";

// Charger les variables d'environnement
dotenv.config();

// Créer l'application Express
const app = express();

// Configurer les middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging des requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/evenements', evenementRoutes);
app.use('/api/salles', salleRoutes);
app.use('/api/seances', seanceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/billets', billetRoutes);
app.use('/api/rapports', rapportRoutes);
app.use('/api/scanner', scannerRoutes);

// Route pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API de billetterie',
    version: '1.0.0',
    status: 'running'
  });
});

// Gestion des routes non trouvées
app.use(notFoundMiddleware);

// Middleware d'erreur global
app.use(errorMiddleware);

export default app;