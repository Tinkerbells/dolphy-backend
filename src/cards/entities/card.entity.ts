import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Deck } from '../../decks/entities/deck.entity';
import { EntityRelationalHelper } from '../../utils/relational-entity-helper';

@Entity('card')
export class Card extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  front: string;

  @Column({ type: 'text' })
  back: string;

  @Column({ type: 'text', nullable: true })
  hint: string;

  // Поля для алгоритма интервального повторения (SRS - Spaced Repetition System)
  @Column({ default: 0 })
  intervalStep: number;

  @Column({ nullable: true, type: 'timestamp' })
  nextReviewDate: Date;

  @Column({ default: 0 })
  correctStreak: number;

  @Column({ default: 0 })
  incorrectStreak: number;

  @ManyToOne(() => Deck, (deck) => deck.cards, { onDelete: 'CASCADE' })
  deck: Deck;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
