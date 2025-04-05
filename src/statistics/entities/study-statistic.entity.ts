import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { Deck } from '../../decks/entities/deck.entity';
import { Card } from '../../cards/entities/card.entity';
import { EntityRelationalHelper } from '../../utils/relational-entity-helper';

@Entity('study_statistic')
export class StudyStatistic extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => Deck)
  deck: Deck;

  @ManyToOne(() => Card, { nullable: true })
  card: Card;

  @Column()
  isCorrect: boolean;

  @Column({ default: 0 })
  timeSpentMs: number;

  @CreateDateColumn()
  createdAt: Date;
}
