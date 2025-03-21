import bcrypt from 'bcryptjs';
import { AppDataSource } from '../utils/database';
import { User } from '../entities/user-entity';
import { logger } from '../utils/logger-utility';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Récupère tous les utilisateurs
   */
  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      logger.error('Erreur lors de la récupération des utilisateurs', error);
      throw error;
    }
  }

  /**
   * Récupère un utilisateur par son ID
   */
  async findById(id: number): Promise<User | null> {
    try {
      return await this.userRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Erreur lors de la récupération de l'utilisateur ${id}`, error);
      throw error;
    }
  }

  /**
   * Récupère un utilisateur par son nom d'utilisateur
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.userRepository.findOneBy({ username });
    } catch (error) {
      logger.error(`Erreur lors de la récupération de l'utilisateur ${username}`, error);
      throw error;
    }
  }

  /**
   * Crée un nouvel utilisateur
   */
  async create(userData: Partial<User>): Promise<User> {
    try {
      // Vérifiez que tous les champs requis sont présents
      if (!userData.username || !userData.password || !userData.email || !userData.fullname) {
        throw new Error("Données utilisateur incomplètes");
      }

      // Hasher le mot de passe
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      const user = this.userRepository.create(userData);
      return await this.userRepository.save(user);
    } catch (error) {
      logger.error('Erreur lors de la création d\'un utilisateur', error);
      throw error;
    }
  }
  /**
   * Met à jour un utilisateur existant
   */
  async update(id: number, userData: Partial<User>): Promise<User | null> {
    try {
      // Hasher le mot de passe si fourni
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      
      await this.userRepository.update(id, userData);
      return await this.userRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de l'utilisateur ${id}`, error);
      throw error;
    }
  }

  /**
   * Supprime un utilisateur
   */
  async delete(id: number): Promise<void> {
    try {
      await this.userRepository.delete(id);
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'utilisateur ${id}`, error);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur existe par son nom d'utilisateur
   */
  async usernameExists(username: string): Promise<boolean> {
    try {
      const count = await this.userRepository.countBy({ username });
      return count > 0;
    } catch (error) {
      logger.error(`Erreur lors de la vérification de l'existence de l'utilisateur ${username}`, error);
      throw error;
    }
  }
}
