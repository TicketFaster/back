import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('historique_reservation')
export class HistoriqueReservation {
  @PrimaryGeneratedColumn({ name: 'id_historique' })
  id: number;

  @Column({ name: 'id_reservation' })
  id_reservation: number;

  @Column({ length: 50, name: 'ancien_statut' })
  ancien_statut: string;

  @Column({ length: 50, name: 'nouveau_statut' })
  nouveau_statut: string;

  @Column({ type: 'timestamp', name: 'date_modification' })
  date_modification: Date;

  @Column({ length: 100 })
  utilisateur: string;
}
