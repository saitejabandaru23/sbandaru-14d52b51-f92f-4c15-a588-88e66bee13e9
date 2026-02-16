import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ default: '' })
  description!: string;

  @Column({ type: 'text', default: 'todo' })
  status!: 'todo' | 'in-progress' | 'done';

  // Match the dashboard theme categories
  @Column({ type: 'text', default: 'claims' })
  category!: 'claims' | 'edu' | 'loans' | 'ops';

  @Column({ type: 'integer', default: 0 })
  sortOrder!: number;

  @Column()
  organizationId!: number;

  @Column()
  createdByUserId!: number;
}
