import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { DeckEntity } from '../../../../../decks/infrastructure/persistence/relational/entities/deck.entity';

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

  @Column()
  deckId: string;

  // Связь ManyToOne с колодой
  @ManyToOne(() => DeckEntity, (deck) => deck.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deckId' })
  deck: DeckEntity;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
