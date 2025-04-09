import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { StudySessionEntity } from './study-session.entity';
import { CardsEntity } from '../../../../../cards/infrastructure/persistence/relational/entities/cards.entity';
import { CardStatus } from '../../../../domain/study-session-card';

@Entity({
  name: 'study_session_card',
})
export class StudySessionCardEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.NEW,
  })
  status: CardStatus;

  @Column({ default: 0 })
  interval: number;

  @Column({ default: 0 })
  easeFactor: number;

  @Column({ default: 0 })
  consecutiveCorrect: number;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ default: 0 })
  attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewedAt?: Date;

  @Column({ nullable: true })
  lastAnswer?: number;

  @ManyToOne(() => StudySessionEntity, (session) => session.cards)
  @JoinColumn({ name: 'sessionId' })
  session: StudySessionEntity;

  @Column({ nullable: true })
  sessionId: string;

  @ManyToOne(() => CardsEntity)
  @JoinColumn({ name: 'cardId' })
  card: CardsEntity;

  @Column({ nullable: true })
  cardId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
