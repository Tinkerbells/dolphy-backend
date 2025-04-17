import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'card',
})
export class CardEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  due: Date;

  @Column({ type: 'real' })
  stability: number;

  @Column({ type: 'real' })
  difficulty: number;

  @Column({ type: 'integer' })
  elapsed_days: number;

  @Column({ type: 'integer' })
  scheduled_days: number;

  @Column({ type: 'integer' })
  reps: number;

  @Column({ type: 'integer' })
  lapses: number;

  @Column()
  state: string;

  @Column({ type: 'timestamp', nullable: true })
  last_review?: Date;

  @Column({ type: 'timestamp' })
  suspended: Date;

  @Column()
  userId: string;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
