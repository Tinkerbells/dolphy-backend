import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { DeckEntity } from '../../../../../decks/infrastructure/persistence/relational/entities/deck.entity';

@Entity({
  name: 'card',
})
export class CardEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  question: string;

  @Column()
  answer: string;

  @Column({ default: 'manual' })
  source: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

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

  @UpdateDateColumn()
  updatedAt: Date;
}
