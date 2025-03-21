import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Seance } from './seance-entity';

@Entity('evenement')
export class Evenement {
  @PrimaryGeneratedColumn({ name: 'id_evenement' })
  id: number;

  @Column({ length: 255 })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  categorie: string;

  @Column({ length: 50 })
  duree: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  prix_standard: number;

  @OneToMany(() => Seance, seance => seance.evenement)
  seances: Seance[];
}
