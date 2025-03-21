"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const database_1 = require("../utils/database");
const reservation_entity_1 = require("../entities/reservation-entity");
const billet_entity_1 = require("../entities/billet-entity");
const seance_entity_1 = require("../entities/seance-entity");
const client_entity_1 = require("../entities/client-entity");
const logger_utility_1 = require("../utils/logger-utility");
class ReservationService {
    constructor() {
        this.reservationRepository = database_1.AppDataSource.getRepository(reservation_entity_1.Reservation);
        this.billetRepository = database_1.AppDataSource.getRepository(billet_entity_1.Billet);
        this.seanceRepository = database_1.AppDataSource.getRepository(seance_entity_1.Seance);
        this.clientRepository = database_1.AppDataSource.getRepository(client_entity_1.Client);
    }
    /**
     * Récupère toutes les réservations avec filtrage optionnel
     */
    async getAllReservations(filtres) {
        try {
            let query = this.reservationRepository.createQueryBuilder('reservation')
                .leftJoinAndSelect('reservation.client', 'client')
                .leftJoinAndSelect('reservation.billets', 'billets')
                .leftJoinAndSelect('billets.seance', 'seance')
                .leftJoinAndSelect('seance.evenement', 'evenement');
            if (filtres) {
                if (filtres.clientId) {
                    query = query.andWhere('reservation.id_client = :clientId', { clientId: filtres.clientId });
                }
                if (filtres.statut) {
                    query = query.andWhere('reservation.statut_paiement = :statut', { statut: filtres.statut });
                }
                if (filtres.dateMin) {
                    query = query.andWhere('reservation.date_reservation >= :dateMin', { dateMin: filtres.dateMin });
                }
                if (filtres.dateMax) {
                    query = query.andWhere('reservation.date_reservation <= :dateMax', { dateMax: filtres.dateMax });
                }
            }
            const reservations = await query.orderBy('reservation.date_reservation', 'DESC').getMany();
            return reservations;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération des réservations: ${error}`);
            throw new Error('Erreur lors de la récupération des réservations');
        }
    }
    /**
     * Récupère une réservation par son ID
     */
    async getReservationById(id) {
        try {
            const reservation = await this.reservationRepository.findOne({
                where: { id },
                relations: ['client', 'billets', 'billets.seance', 'billets.seance.evenement', 'billets.seance.salle']
            });
            return reservation;
        }
        catch (error) {
            logger_utility_1.logger.error(`Erreur lors de la récupération de la réservation ${id}: ${error}`);
            throw new Error(`Erreur lors de la récupération de la réservation ${id}`);
        }
    }
    /**
     * Crée une nouvelle réservation avec ses billets
     */
    async createReservation(data) {
        // Utiliser une transaction pour garantir l'intégrité des données
        const queryRunner = database_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Vérifier si le client existe
            const client = await this.clientRepository.findOneBy({ id: data.id_client });
            if (!client) {
                throw new Error('Client non trouvé');
            }
            // Vérifier si des billets sont demandés
            if (!data.billets || data.billets.length === 0) {
                throw new Error('Aucun billet spécifié pour la réservation');
            }
            // Calculer le montant total initial (sera mis à jour par trigger après insertion des billets)
            let montantTotal = 0;
            // Vérifier la disponibilité des places pour chaque séance
            for (const billetData of data.billets) {
                const seance = await this.seanceRepository.findOne({
                    where: { id: billetData.id_seance },
                    relations: ['evenement']
                });
                if (!seance) {
                    throw new Error(`Séance avec ID ${billetData.id_seance} non trouvée`);
                }
                if (seance.places_disponibles <= 0) {
                    throw new Error(`Plus de places disponibles pour la séance ${seance.id}`);
                }
                // Calculer le prix en fonction du type de tarif
                if (!billetData.prix_final) {
                    const prixBase = seance.evenement.prix_standard;
                    const prixFinal = await database_1.AppDataSource.query('SELECT fn_CalculPrixReduit($1, $2) as prix', [prixBase, billetData.type_tarif]);
                    montantTotal += parseFloat(prixFinal[0].prix);
                }
                else {
                    montantTotal += billetData.prix_final;
                }
            }
            // Créer la réservation
            const nouvelleReservation = new reservation_entity_1.Reservation();
            nouvelleReservation.id_client = data.id_client;
            nouvelleReservation.date_reservation = new Date();
            nouvelleReservation.statut_paiement = 'EN_ATTENTE';
            nouvelleReservation.montant_total = montantTotal;
            const reservationInserted = await queryRunner.manager.save(nouvelleReservation);
            // Créer les billets associés
            for (const billetData of data.billets) {
                const seance = await this.seanceRepository.findOne({
                    where: { id: billetData.id_seance },
                    relations: ['evenement']
                });
                if (!seance) {
                    // Ne devrait pas arriver car vérifié précédemment
                    continue;
                }
                // Calculer le prix si non spécifié
                let prixFinal = billetData.prix_final;
                if (!prixFinal) {
                    const prixBase = seance.evenement.prix_standard;
                    const resultatPrix = await database_1.AppDataSource.query('SELECT fn_CalculPrixReduit($1, $2) as prix', [prixBase, billetData.type_tarif]);
                    prixFinal = parseFloat(resultatPrix[0].prix);
                }
                const nouveauBillet = new billet_entity_1.Billet();
                nouveauBillet.id_reservation = reservationInserted.id;
                nouveauBillet.id_seance = billetData.id_seance;
                nouveauBillet.type_tarif = billetData.type_tarif;
                nouveauBillet.prix_final = prixFinal;
                nouveauBillet.statut = 'VALIDE';
                // Le code-barre sera généré automatiquement par le trigger
                await queryRunner.manager.save(nouveauBillet);
                // Mettre à jour le nombre de places disponibles
                seance.places_disponibles--;
                await queryRunner.manager.save(seance);
            }
            // Recalculer le montant total
            const updatedReservation = await queryRunner.manager.findOne(reservation_entity_1.Reservation, {
                where: { id: reservationInserted.id },
                relations: ['billets']
            });
            // Validation de la transaction
            await queryRunner.commitTransaction();
            return await this.getReservationById(reservationInserted.id);
        }
        catch (error) {
            // Annulation de la transaction en cas d'erreur
            await queryRunner.rollbackTransaction();
            logger_utility_1.logger.error(`Erreur lors de la création de la réservation: ${error}`);
            throw error;
        }
        finally {
            // Libération du queryRunner
            await queryRunner.release();
        }
    }
    /**
     * Met à jour une réservation existante
     */
    async updateReservation(id, data) {
        // Utiliser une transaction pour garantir l'intégrité des données
        const queryRunner = database_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Vérifier si la réservation existe
            const reservation = await this.reservationRepository.findOne({
                where: { id },
                relations: ['billets']
            });
            if (!reservation) {
                throw new Error('Réservation non trouvée');
            }
            // Mise à jour du statut de paiement si spécifié
            if (data.statut_paiement && reservation.statut_paiement !== data.statut_paiement) {
                reservation.statut_paiement = data.statut_paiement;
                await queryRunner.manager.save(reservation);
            }
            // Gestion des billets si spécifiés
            if (data.billets) {
                // Supprimer des billets
                if (data.billets.supprimer && data.billets.supprimer.length > 0) {
                    for (const billetId of data.billets.supprimer) {
                        const billet = await this.billetRepository.findOne({
                            where: { id: billetId, id_reservation: id },
                            relations: ['seance']
                        });
                        if (billet) {
                            // Si le billet est valide, libérer la place
                            if (billet.statut === 'VALIDE') {
                                const seance = billet.seance;
                                seance.places_disponibles++;
                                await queryRunner.manager.save(seance);
                            }
                            await queryRunner.manager.remove(billet);
                        }
                    }
                }
                // Modifier des billets
                if (data.billets.modifier && data.billets.modifier.length > 0) {
                    for (const modif of data.billets.modifier) {
                        const billet = await this.billetRepository.findOne({
                            where: { id: modif.id, id_reservation: id },
                            relations: ['seance']
                        });
                        if (billet) {
                            const ancienStatut = billet.statut;
                            billet.statut = modif.statut;
                            await queryRunner.manager.save(billet);
                            // Gestion des places disponibles en fonction du changement de statut
                            if (ancienStatut === 'VALIDE' && modif.statut === 'ANNULE') {
                                const seance = billet.seance;
                                seance.places_disponibles++;
                                await queryRunner.manager.save(seance);
                            }
                            else if (ancienStatut === 'ANNULE' && modif.statut === 'VALIDE') {
                                const seance = billet.seance;
                                if (seance.places_disponibles <= 0) {
                                    throw new Error(`Plus de places disponibles pour la séance ${seance.id}`);
                                }
                                seance.places_disponibles--;
                                await queryRunner.manager.save(seance);
                            }
                        }
                    }
                }
                // Ajouter des billets
                if (data.billets.ajouter && data.billets.ajouter.length > 0) {
                    for (const billetData of data.billets.ajouter) {
                        const seance = await this.seanceRepository.findOne({
                            where: { id: billetData.id_seance },
                            relations: ['evenement']
                        });
                        if (!seance) {
                            throw new Error(`Séance avec ID ${billetData.id_seance} non trouvée`);
                        }
                        if (seance.places_disponibles <= 0) {
                            throw new Error(`Plus de places disponibles pour la séance ${seance.id}`);
                        }
                        // Calculer le prix si non spécifié
                        let prixFinal = billetData.prix_final;
                        if (!prixFinal) {
                            const prixBase = seance.evenement.prix_standard;
                            const resultatPrix = await database_1.AppDataSource.query('SELECT fn_CalculPrixReduit($1, $2) as prix', [prixBase, billetData.type_tarif]);
                            prixFinal = parseFloat(resultatPrix[0].prix);
                        }
                        const nouveauBillet = new billet_entity_1.Billet();
                        nouveauBillet.id_reservation = id;
                        nouveauBillet.id_seance = billetData.id_seance;
                        nouveauBillet.type_tarif = billetData.type_tarif;
                        nouveauBillet.prix_final = prixFinal;
                        nouveauBillet.statut = 'VALIDE';
                        await queryRunner.manager.save(nouveauBillet);
                        // Mettre à jour le nombre de places disponibles
                        seance.places_disponibles--;
                        await queryRunner.manager.save(seance);
                    }
                }
            }
            // Validation de la transaction
            await queryRunner.commitTransaction();
            return await this.getReservationById(id);
        }
        catch (error) {
            // Annulation de la transaction en cas d'erreur
            await queryRunner.rollbackTransaction();
            logger_utility_1.logger.error(`Erreur lors de la mise à jour de la réservation ${id}: ${error}`);
            throw error;
        }
        finally {
            // Libération du queryRunner
            await queryRunner.release();
        }
    }
    /**
     * Annule une réservation et tous ses billets
     */
    async cancelReservation(id) {
        // Utiliser une transaction pour garantir l'intégrité des données
        const queryRunner = database_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Vérifier si la réservation existe
            const reservation = await this.reservationRepository.findOne({
                where: { id },
                relations: ['billets']
            });
            if (!reservation) {
                throw new Error('Réservation non trouvée');
            }
            // Mettre à jour le statut de la réservation
            reservation.statut_paiement = 'ANNULE';
            await queryRunner.manager.save(reservation);
            // Annuler tous les billets et libérer les places
            for (const billet of reservation.billets) {
                if (billet.statut === 'VALIDE') {
                    // Récupérer la séance pour mettre à jour les places disponibles
                    const seance = await this.seanceRepository.findOneBy({ id: billet.id_seance });
                    if (seance) {
                        seance.places_disponibles++;
                        await queryRunner.manager.save(seance);
                    }
                    // Mettre à jour le statut du billet
                    billet.statut = 'ANNULE';
                    await queryRunner.manager.save(billet);
                }
            }
            // Validation de la transaction
            await queryRunner.commitTransaction();
            return await this.getReservationById(id);
        }
        catch (error) {
            // Annulation de la transaction en cas d'erreur
            await queryRunner.rollbackTransaction();
            logger_utility_1.logger.error(`Erreur lors de l'annulation de la réservation ${id}: ${error}`);
            throw error;
        }
        finally {
            // Libération du queryRunner
            await queryRunner.release();
        }
    }
    /**
     * Supprime une réservation et tous ses billets
     */
    async deleteReservation(id) {
        // Utiliser une transaction pour garantir l'intégrité des données
        const queryRunner = database_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Vérifier si la réservation existe
            const reservation = await this.reservationRepository.findOne({
                where: { id },
                relations: ['billets']
            });
            if (!reservation) {
                throw new Error('Réservation non trouvée');
            }
            // Libérer les places pour les billets valides
            for (const billet of reservation.billets) {
                if (billet.statut === 'VALIDE') {
                    const seance = await this.seanceRepository.findOneBy({ id: billet.id_seance });
                    if (seance) {
                        seance.places_disponibles++;
                        await queryRunner.manager.save(seance);
                    }
                }
                // Supprimer le billet
                await queryRunner.manager.remove(billet);
            }
            // Supprimer la réservation
            await queryRunner.manager.remove(reservation);
            // Validation de la transaction
            await queryRunner.commitTransaction();
            return true;
        }
        catch (error) {
            // Annulation de la transaction en cas d'erreur
            await queryRunner.rollbackTransaction();
            logger_utility_1.logger.error(`Erreur lors de la suppression de la réservation ${id}: ${error}`);
            throw error;
        }
        finally {
            // Libération du queryRunner
            await queryRunner.release();
        }
    }
}
exports.ReservationService = ReservationService;
//# sourceMappingURL=reservation-service.js.map