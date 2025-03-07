import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger-utility';
import { UserService } from '../services/user-service';

export class AuthController {
  private userService = new UserService();

  /**
   * Connecte un utilisateur
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
        return;
      }
      
      // Récupérer l'utilisateur
      const user = await this.userService.findByUsername(username);
      
      if (!user) {
        res.status(401).json({ message: 'Identifiants incorrects' });
        return;
      }
      
      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Identifiants incorrects' });
        return;
      }
      
      // Générer le token JWT
      const token = this.generateToken(user);
      
      // Renvoyer le token et les infos utilisateur (sans le mot de passe)
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      logger.error('Erreur lors de la connexion', error);
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  }

  /**
   * Rafraîchit le token d'un utilisateur
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // L'utilisateur est déjà authentifié grâce au middleware auth
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({ message: 'Authentification requise' });
        return;
      }
      
      // Récupérer l'utilisateur depuis la base de données pour avoir des infos à jour
      const dbUser = await this.userService.findById(user.id);
      
      if (!dbUser) {
        res.status(401).json({ message: 'Utilisateur non trouvé' });
        return;
      }
      
      // Générer un nouveau token
      const token = this.generateToken(dbUser);
      
      // Renvoyer le token et les infos utilisateur (sans le mot de passe)
      const { password: _, ...userWithoutPassword } = dbUser;
      
      res.status(200).json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      logger.error('Erreur lors du rafraîchissement du token', error);
      res.status(500).json({ message: 'Erreur lors du rafraîchissement du token' });
    }
  }

  /**
   * Génère un token JWT pour un utilisateur
   */
  private generateToken(user: any): string {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    const secretKey = process.env.JWT_SECRET || 'billetterie-default-secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    return jwt.sign(payload, secretKey, { expiresIn });
  }
}
