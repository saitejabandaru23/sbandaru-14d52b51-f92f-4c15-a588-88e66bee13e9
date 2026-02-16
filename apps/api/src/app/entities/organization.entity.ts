import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'integer', nullable: true })
  parentId!: number | null;

  @OneToMany(() => User, (u) => u.organization)
  users!: User[];
}
