import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  action!: string;

  @Column({ type: 'integer' })
  userId!: number;

  @Column({ type: 'integer' })
  organizationId!: number;

  @Column({ type: 'boolean', default: true })
  allowed!: boolean;

  @Column({ type: 'text', nullable: true })
  resource!: string | null;

  @Column({ type: 'integer', nullable: true })
  resourceId!: number | null;

  @Column({ type: 'text', nullable: true })
  details!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
