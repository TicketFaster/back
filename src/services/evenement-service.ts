import { Evenement } from '../entities/evenement-entity';
import { AppDataSource } from '../utils/database';
import { logger } from '../utils/logger-utility';

export class EvenementService {
  private evenementRepository = AppDataSource.getRepository(Evenement);

  async findAll(): Promise<Evenement[]> {
    try {
      return await this.evenementRepository.find();
    } catch (error) {
      logger.error('Erreur lors de la récupération des événements', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<Evenement | null> {
    try {
      return await this.evenementRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Erreur lors de la récupération de l'événement ${id}`, error);
      throw error;
    }
  }

  async create(evenementData: Partial<Evenement>): Promise<Evenement> {
    try {
      const evenement = this.evenementRepository.create(evenementData);
      return await this.evenementRepository.save(evenement);
    } catch (error) {
      logger.error('Erreur lors de la création d\'un événement', error);
      throw error;
    }
  }

  async update(id: number, evenementData: Partial<Evenement>): Promise<Evenement | null> {
    try {
      await this.evenementRepository.update(id, evenementData);
      return await this.evenementRepository.findOneBy({ id });
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour de l'événement ${id}`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.evenementRepository.delete(id);
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'événement ${id}`, error);
      throw error;
    }
  }
}
