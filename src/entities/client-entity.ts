import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from './reservation-entity';

@Entity('client')
export class Client {
  @PrimaryGeneratedColumn({ name: 'id_client' })
  id: number;

  @Column({ length: 255 })
  nom: string;

  @Column({ length: 255 })
  prenom: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  telephone: string;

  @OneToMany(() => Reservation, reservation => reservation.client)
  reservations: Reservation[];
}
