import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CardEntity } from 'src/cards/infrastructure/persistence/relational/entities/card.entity';

@Entity({
  name: 'review_log',
})
export class ReviewLogEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cardId: string;

  @ManyToOne(() => CardEntity)
  @JoinColumn({ name: 'cardId' })
  card: CardEntity;

  @Column()
  grade: string;

  @Column()
  state: string;

  @Column({ type: 'timestamp' })
  due: Date;

  @Column({ type: 'real' })
  stability: number;

  @Column({ type: 'real' })
  difficulty: number;

  @Column({ type: 'integer' })
  elapsed_days: number;

  @Column({ type: 'integer' })
  last_elapsed_days: number;

  @Column({ type: 'integer' })
  scheduled_days: number;

  @Column({ type: 'timestamp' })
  review: Date;

  @Column({ type: 'integer', default: 0 })
  duration: number;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
