import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Client } from './client-entity';
import { Billet } from './billet-entity';

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn({ name: 'id_reservation' })
  id: number;

  @Column({ name: 'id_client' })
  id_client: number;

  @Column({ type: 'timestamp' })
  date_reservation: Date;

  @Column({ length: 50 })
  statut_paiement: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montant_total: number;

  @ManyToOne(() => Client, client => client.reservations)
  @JoinColumn({ name: 'id_client' })
  client: Client;

  @OneToMany(() => Billet, billet => billet.reservation)
  billets: Billet[];
}
