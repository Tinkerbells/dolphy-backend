import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { State } from 'ts-fsrs';
import { EntityRelationalHelper } from 'src/utils/relational-entity-helper';
import { DeckEntity } from 'src/decks/infrastructure/persistence/relational/entities/deck.entity';

@Entity('cards')
export class CardEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  front: string;

  @Column({ type: 'text', nullable: false })
  back: string;

  @Column({ type: 'text', nullable: true })
  hint?: string;

  @Column({ type: 'int', default: 0 })
  intervalStep: number;

  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate?: Date;

  @Column({ type: 'int', default: 0 })
  correctStreak: number;

  @Column({ type: 'int', default: 0 })
  incorrectStreak: number;

  @Column({
    type: 'int',
    enum: State,
    default: State.New,
  })
  state: State;

  @Column({ default: false })
  suspended: boolean;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => DeckEntity, (deck) => deck.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deckId' })
  deck: DeckEntity;

  @Column()
  deckId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
