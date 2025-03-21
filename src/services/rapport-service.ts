import { AppDataSource } from '../utils/database';
import { Evenement } from '../entities/evenement-entity';
import { Billet } from '../entities/billet-entity';
import { Reservation } from '../entities/reservation-entity';
import { logger } from '../utils/logger-utility';

export class RapportService {
  /**
   * Génère un rapport de ventes pour une période donnée
   */
  async generateRapportVentes(dateDebut: Date, dateFin: Date) {
    try {
      // Utilisation de la fonction SQL pour obtenir le rapport de ventes
      const rapport = await AppDataSource.query(
        'SELECT * FROM fn_RapportVentes($1, $2)',
        [dateDebut, dateFin]
      );
      
      return rapport;
    } catch (error) {
      logger.error(`Erreur lors de la génération du rapport de ventes: ${error}`);
      throw new Error('Erreur lors de la génération du rapport de ventes');
    }
  }

  /**
   * Calcule le taux de remplissage pour une séance
   */
  async getTauxRemplissage(seanceId: number) {
    try {
      const result = await AppDataSource.query(
        'SELECT fn_TauxRemplissage($1) as taux',
        [seanceId]
      );
      
      return result[0].taux;
    } catch (error) {
      logger.error(`Erreur lors du calcul du taux de remplissage pour la séance ${seanceId}: ${error}`);
      throw new Error(`Erreur lors du calcul du taux de remplissage pour la séance ${seanceId}`);
    }
  }

  /**
   * Génère un rapport de ventes par catégorie d'événement
   */
  async getVentesParCategorie(dateDebut: Date, dateFin: Date) {
    try {
      const query = `
        SELECT
          e.categorie,
          COUNT(b.id_billet) as nombre_billets,
          SUM(b.prix_final) as montant_total
        FROM
          billet b
          JOIN seance s ON b.id_seance = s.id_seance
          JOIN evenement e ON s.id_evenement = e.id_evenement
          JOIN reservation r ON b.id_reservation = r.id_reservation
        WHERE
          s.date_heure BETWEEN $1 AND $2
          AND r.statut_paiement = 'PAYE'
          AND b.statut = 'VALIDE'
        GROUP BY
          e.categorie
        ORDER BY
          montant_total DESC
      `;
      
      const result = await AppDataSource.query(query, [dateDebut, dateFin]);
      return result;
    } catch (error) {
      logger.error(`Erreur lors de la génération du rapport de ventes par catégorie: ${error}`);
      throw new Error('Erreur lors de la génération du rapport de ventes par catégorie');
    }
  }

  /**
   * Génère un rapport des meilleures ventes d'événements
   */
  async getMeilleuresVentes(dateDebut: Date, dateFin: Date, limit: number = 10) {
    try {
      const query = `
        SELECT
          e.id_evenement,
          e.titre,
          COUNT(b.id_billet) as nombre_billets,
          SUM(b.prix_final) as montant_total,
          AVG(fn_TauxRemplissage(s.id_seance)) as taux_remplissage_moyen
        FROM
          billet b
          JOIN seance s ON b.id_seance = s.id_seance
          JOIN evenement e ON s.id_evenement = e.id_evenement
          JOIN reservation r ON b.id_reservation = r.id_reservation
        WHERE
          s.date_heure BETWEEN $1 AND $2
          AND r.statut_paiement = 'PAYE'
          AND b.statut = 'VALIDE'
        GROUP BY
          e.id_evenement, e.titre
        ORDER BY
          montant_total DESC
        LIMIT $3
      `;
      
      const result = await AppDataSource.query(query, [dateDebut, dateFin, limit]);
      return result;
    } catch (error) {
      logger.error(`Erreur lors de la génération du rapport des meilleures ventes: ${error}`);
      throw new Error('Erreur lors de la génération du rapport des meilleures ventes');
    }
  }

  /**
   * Génère un rapport de fréquentation par tranche horaire
   */
  async getFrequentationParHoraire(dateDebut: Date, dateFin: Date) {
    try {
      const query = `
        SELECT
          EXTRACT(DOW FROM s.date_heure) as jour_semaine,
          EXTRACT(HOUR FROM s.date_heure) as heure,
          COUNT(b.id_billet) as nombre_billets,
          AVG(fn_TauxRemplissage(s.id_seance)) as taux_remplissage_moyen
        FROM
          billet b
          JOIN seance s ON b.id_seance = s.id_seance
          JOIN reservation r ON b.id_reservation = r.id_reservation
        WHERE
          s.date_heure BETWEEN $1 AND $2
          AND r.statut_paiement = 'PAYE'
          AND b.statut = 'VALIDE'
        GROUP BY
          jour_semaine, heure
        ORDER BY
          jour_semaine, heure
      `;
      
      const result = await AppDataSource.query(query, [dateDebut, dateFin]);
      
      // Transformation des résultats pour plus de lisibilité
      const joursSemaine = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      
      return result.map((item: { jour_semaine: number; heure: number; nombre_billets: any; taux_remplissage_moyen: string; })=> ({
        jour: joursSemaine[Math.floor(item.jour_semaine)],
        heure: `${Math.floor(item.heure)}h`,
        nombre_billets: item.nombre_billets,
        taux_remplissage_moyen: parseFloat(item.taux_remplissage_moyen).toFixed(2)
      }));
    } catch (error) {
      logger.error(`Erreur lors de la génération du rapport de fréquentation par horaire: ${error}`);
      throw new Error('Erreur lors de la génération du rapport de fréquentation par horaire');
    }
  }

  /**
   * Génère un rapport sur les types de tarifs les plus utilisés
   */
  async getStatistiquesTarifs(dateDebut: Date, dateFin: Date) {
    try {
      const query = `
        SELECT
          b.type_tarif,
          COUNT(b.id_billet) as nombre_billets,
          SUM(b.prix_final) as montant_total,
          ROUND(AVG(b.prix_final), 2) as prix_moyen
        FROM
          billet b
          JOIN seance s ON b.id_seance = s.id_seance
          JOIN reservation r ON b.id_reservation = r.id_reservation
        WHERE
          s.date_heure BETWEEN $1 AND $2
          AND r.statut_paiement = 'PAYE'
          AND b.statut = 'VALIDE'
        GROUP BY
          b.type_tarif
        ORDER BY
          nombre_billets DESC
      `;
      
      const result = await AppDataSource.query(query, [dateDebut, dateFin]);
      return result;
    } catch (error) {
      logger.error(`Erreur lors de la génération des statistiques de tarifs: ${error}`);
      throw new Error('Erreur lors de la génération des statistiques de tarifs');
    }
  }

  /**
   * Obtient les statistiques globales pour le tableau de bord
   */
  async getStatistiquesGlobales() {
    try {
      // Nombre total de clients
      const nbClients = await AppDataSource
        .getRepository('client')
        .createQueryBuilder('client')
        .select('COUNT(client.id_client)', 'total')
        .getRawOne();
      
      // Nombre total d'événements
      const nbEvenements = await AppDataSource
        .getRepository(Evenement)
        .createQueryBuilder('evenement')
        .select('COUNT(evenement.id_evenement)', 'total')
        .getRawOne();
      
      // Nombre total de réservations
      const nbReservations = await AppDataSource
        .getRepository(Reservation)
        .createQueryBuilder('reservation')
        .select('COUNT(reservation.id_reservation)', 'total')
        .getRawOne();
      
      // Nombre total de billets valides
      const nbBilletsValides = await AppDataSource
        .getRepository(Billet)
        .createQueryBuilder('billet')
        .where('billet.statut = :statut', { statut: 'VALIDE' })
        .select('COUNT(billet.id_billet)', 'total')
        .getRawOne();
      
      // Montant total des ventes
      const montantTotal = await AppDataSource
        .getRepository(Billet)
        .createQueryBuilder('billet')
        .innerJoin('billet.reservation', 'reservation')
        .where('reservation.statut_paiement = :statut', { statut: 'PAYE' })
        .select('SUM(billet.prix_final)', 'total')
        .getRawOne();
      
      // Taux de remplissage moyen
      const tauxRemplissageMoyen = await AppDataSource.query(`
        SELECT AVG(fn_TauxRemplissage(id_seance)) as taux_moyen 
        FROM seance 
        WHERE date_heure < NOW()
      `);
      
      return {
        nbClients: parseInt(nbClients?.total || '0'),
        nbEvenements: parseInt(nbEvenements?.total || '0'),
        nbReservations: parseInt(nbReservations?.total || '0'),
        nbBilletsValides: parseInt(nbBilletsValides?.total || '0'),
        montantTotal: parseFloat(montantTotal?.total || '0').toFixed(2),
        tauxRemplissageMoyen: parseFloat(tauxRemplissageMoyen[0]?.taux_moyen || '0').toFixed(2)
      };
    } catch (error) {
      logger.error(`Erreur lors de la récupération des statistiques globales: ${error}`);
      throw new Error('Erreur lors de la récupération des statistiques globales');
    }
  }
}