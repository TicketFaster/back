"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BilletService = void 0;
const database_1 = require("../utils/database");
const billet_entity_1 = require("../entities/billet-entity");
const seance_entity_1 = require("../entities/seance-entity");
const logger_utility_1 = require("../utils/logger-utility");
class BilletService {
    constructor() {
        this.billetRepository = database_1.AppDataSource.getRepository(billet_entity_1.Billet);
        this.seanceRepository = database_1.AppDataSource.getRepository(seance_entity_1.Seance);
    }
    /**
     * Récupère tous les billets avec filtrage optionnel
     */
    async getAllBillets(filtres) {
        try {
            let query = this.billetRepository.createQueryBuilder('billet')
                .leftJoinAndSelect('billet.reservation', 'reservation')
                .leftJoinAndSelect('billet.seance', 'seance')
                .leftJoinAndSelect('seance.evenement', 'evenement');
            if (filtres) {
                if (filtres.reservationId) {
                    query = query.andWhere('billet.id_reservation = :reservationId', { reservationId: filtres.reservationId });
                }
                if (filtres.seanceId) {
                    query = query.andWhere('billet.id_seance = :seanceId', { seanceId: filtres.seanceId });
                }
                if (filtres.statut) {
                    query = query.andWhere('billet.statut = :statut', { statut: filtres.statut });
                }
                if (filtres.typeTarif) {
                    query = query.andWhere('billet.type_tarif = :typeTarif', { typeTarif: filtres.typeTarif });
                }
            }
            const billets = await query.orderBy('billet.id', 'DESC').getMany();
            return billets;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération des billets: ${error}`);
            throw new Error('Erreur lors de la récupération des billets');
        }
    }
    /**
     * Récupère un billet par son ID
     */
    async getBilletById(id) {
        try {
            const billet = await this.billetRepository.findOne({
                where: { id },
                relations: ['reservation', 'seance', 'seance.evenement', 'reservation.client']
            });
            return billet;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération du billet ${id}: ${error}`);
            throw new Error(`Erreur lors de la récupération du billet ${id}`);
        }
    }
    /**
     * Récupère un billet par son code-barre
     */
    async getBilletByCodeBarre(codeBarre) {
        try {
            const billet = await this.billetRepository.findOne({
                where: { code_barre: codeBarre },
                relations: ['reservation', 'seance', 'seance.evenement', 'reservation.client']
            });
            return billet;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération du billet avec code-barre ${codeBarre}: ${error}`);
            throw new Error(`Erreur lors de la récupération du billet avec code-barre ${codeBarre}`);
        }
    }
    /**
     * Crée un nouveau billet
     */
    async createBillet(billetData) {
        try {
            // Vérifier si des places sont disponibles
            const seance = await this.seanceRepository.findOneBy({ id: billetData.id_seance });
            if (!seance) {
                throw new Error('Séance non trouvée');
            }
            if (seance.places_disponibles <= 0) {
                throw new Error('Plus de places disponibles pour cette séance');
            }
            // Créer le billet
            const nouveauBillet = this.billetRepository.create(billetData);
            const resultat = await this.billetRepository.save(nouveauBillet);
            // Mettre à jour le nombre de places disponibles
            seance.places_disponibles--;
            await this.seanceRepository.save(seance);
            return resultat;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la création du billet: ${error}`);
            throw error;
        }
    }
    /**
     * Met à jour le statut d'un billet
     */
    async updateBilletStatus(id, nouveauStatut) {
        try {
            const billet = await this.billetRepository.findOne({
                where: { id },
                relations: ['seance']
            });
            if (!billet) {
                throw new Error('Billet non trouvé');
            }
            const ancienStatut = billet.statut;
            billet.statut = nouveauStatut;
            await this.billetRepository.save(billet);
            // Gestion des places disponibles en fonction du changement de statut
            if (ancienStatut === 'VALIDE' && nouveauStatut === 'ANNULE') {
                const seance = await this.seanceRepository.findOneBy({ id: billet.id_seance });
                if (seance) {
                    seance.places_disponibles++;
                    await this.seanceRepository.save(seance);
                }
            }
            else if (ancienStatut === 'ANNULE' && nouveauStatut === 'VALIDE') {
                const seance = await this.seanceRepository.findOneBy({ id: billet.id_seance });
                if (seance) {
                    if (seance.places_disponibles <= 0) {
                        throw new Error('Plus de places disponibles pour cette séance');
                    }
                    seance.places_disponibles--;
                    await this.seanceRepository.save(seance);
                }
            }
            return billet;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la mise à jour du statut du billet ${id}: ${error}`);
            throw error;
        }
    }
    /**
     * Supprime un billet
     */
    async deleteBillet(id) {
        try {
            const billet = await this.billetRepository.findOne({
                where: { id },
                relations: ['seance']
            });
            if (!billet) {
                throw new Error('Billet non trouvé');
            }
            // Si le billet est valide, libérer la place
            if (billet.statut === 'VALIDE') {
                const seance = await this.seanceRepository.findOneBy({ id: billet.id_seance });
                if (seance) {
                    seance.places_disponibles++;
                    await this.seanceRepository.save(seance);
                }
            }
            await this.billetRepository.remove(billet);
            return true;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la suppression du billet ${id}: ${error}`);
            throw error;
        }
    }
    /**
     * Valide un billet lors du scan
     */
    async scannerBillet(codeBarre) {
        try {
            const billet = await this.getBilletByCodeBarre(codeBarre);
            if (!billet) {
                throw new Error('Billet non trouvé');
            }
            // Vérifier si la séance n'est pas dépassée
            const seance = await this.seanceRepository.findOne({
                where: { id: billet.id_seance },
                relations: ['evenement']
            });
            if (!seance) {
                throw new Error('Séance non trouvée');
            }
            const maintenant = new Date();
            if (seance.date_heure < maintenant) {
                // La séance a commencé, vérifier si elle est toujours en cours
                const dureeMs = this.parseDuree(seance.evenement.duree);
                const finSeance = new Date(seance.date_heure.getTime() + dureeMs);
                if (maintenant > finSeance) {
                    return {
                        valide: false,
                        message: 'Séance terminée',
                        billet,
                        seance
                    };
                }
            }
            // Vérifier le statut du billet
            if (billet.statut !== 'VALIDE') {
                return {
                    valide: false,
                    message: `Billet ${billet.statut.toLowerCase()}`,
                    billet,
                    seance
                };
            }
            return {
                valide: true,
                message: 'Billet valide',
                billet,
                seance
            };
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors du scan du billet ${codeBarre}: ${error}`);
            throw error;
        }
    }
    /**
     * Convertit une durée au format string (ex: "2h30") en millisecondes
     */
    parseDuree(duree) {
        try {
            const heuresMatch = duree.match(/(\d+)\s*h/);
            const minutesMatch = duree.match(/(\d+)\s*min/);
            let heures = 0;
            let minutes = 0;
            if (heuresMatch && heuresMatch[1]) {
                heures = parseInt(heuresMatch[1]);
            }
            if (minutesMatch && minutesMatch[1]) {
                minutes = parseInt(minutesMatch[1]);
            }
            return (heures * 60 * 60 * 1000) + (minutes * 60 * 1000);
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors du parsing de la durée ${duree}: ${error}`);
            // Par défaut, retourner 2 heures en millisecondes
            return 2 * 60 * 60 * 1000;
        }
    }
}
exports.BilletService = BilletService;
//# sourceMappingURL=billet-service.js.map