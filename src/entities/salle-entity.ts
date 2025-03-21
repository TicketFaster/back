import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Seance } from './seance-entity';

@Entity('salle')
export class Salle {
  @PrimaryGeneratedColumn({ name: 'id_salle' })
  id: number;

  @Column({ length: 255 })
  nom: string;

  @Column()
  capacite: number;

  @Column({ length: 255, nullable: true })
  configuration: string;

  @OneToMany(() => Seance, seance => seance.salle)
  seances: Seance[];
}
