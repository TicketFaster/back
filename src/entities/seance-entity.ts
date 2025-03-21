import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Evenement } from './evenement-entity';
import { Salle } from './salle-entity';
import { Billet } from './billet-entity';

@Entity('seance')
export class Seance {
  @PrimaryGeneratedColumn({ name: 'id_seance' })
  id: number;

  @Column({ name: 'id_evenement' })
  id_evenement: number;

  @Column({ type: 'timestamp' })
  date_heure: Date;

  @Column({ name: 'salle_id' })
  salle_id: number;

  @Column()
  places_disponibles: number;

  @ManyToOne(() => Evenement, evenement => evenement.seances)
  @JoinColumn({ name: 'id_evenement' })
  evenement: Evenement;

  @ManyToOne(() => Salle, salle => salle.seances)
  @JoinColumn({ name: 'salle_id' })
  salle: Salle;

  @OneToMany(() => Billet, billet => billet.seance)
  billets: Billet[];
}
