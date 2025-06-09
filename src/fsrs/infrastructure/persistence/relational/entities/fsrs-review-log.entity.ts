import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { FsrsCardEntity } from './fsrs-card.entity';

@Entity({
  name: 'fsrs_review_log',
})
@Index(['fsrsCardId', 'createdAt'])
export class FsrsReviewLogEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index('IDX_FSRS_REVIEW_LOG_CARD_ID')
  fsrsCardId: string;

  @ManyToOne(() => FsrsCardEntity, {
    eager: false,
    cascade: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fsrsCardId' })
  fsrsCard?: FsrsCardEntity;

  // Review log data from ts-fsrs
  @Column()
  rating: number;

  @Column({ type: 'timestamp' })
  review: Date;

  @Column()
  state: number;

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

  @CreateDateColumn()
  createdAt: Date;
}
