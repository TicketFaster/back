import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Reservation } from './reservation-entity';
import { Seance } from './seance-entity';

@Entity('billet')
export class Billet {
  @PrimaryGeneratedColumn({ name: 'id_billet' })
  id: number;

  @Column({ name: 'id_reservation' })
  id_reservation: number;

  @Column({ name: 'id_seance' })
  id_seance: number;

  @Column({ length: 50 })
  type_tarif: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix_final: number;

  @Column({ length: 100 })
  code_barre: string;

  @Column({ length: 50 })
  statut: string;

  @ManyToOne(() => Reservation, reservation => reservation.billets)
  @JoinColumn({ name: 'id_reservation' })
  reservation: Reservation;

  @ManyToOne(() => Seance, seance => seance.billets)
  @JoinColumn({ name: 'id_seance' })
  seance: Seance;
}
