import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Organization } from './organization.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'text', default: 'viewer' })
  role!: 'owner' | 'admin' | 'viewer';

  @Column()
  organizationId!: number;

  @ManyToOne(() => Organization, (org) => org.users, { eager: true })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;
}
