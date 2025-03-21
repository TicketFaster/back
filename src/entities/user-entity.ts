import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ length: 100 })
  fullname: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: ['ADMIN', 'USER', 'MANAGER'],
    default: 'USER'
  })
  role: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}