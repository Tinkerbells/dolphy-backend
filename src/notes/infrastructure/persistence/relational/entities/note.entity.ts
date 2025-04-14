import { CardEntity } from 'src/cards/infrastructure/persistence/relational/entities/card.entity';
import { DeckEntity } from 'src/decks/infrastructure/persistence/relational/entities/deck.entity';
import { EntityRelationalHelper } from 'src/utils/relational-entity-helper';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('note')
export class NoteEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column()
  answer: string;

  @Column()
  source: string;

  @Column({ nullable: true })
  sourceId?: string;

  @Column({ type: 'jsonb', default: '{}' })
  extend: Record<string, any>;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => DeckEntity, (decks) => decks.notes)
  @JoinColumn({ name: 'did' })
  deck: DeckEntity;

  @Column()
  did: number;

  @Column()
  uid: number;

  @OneToMany(() => CardEntity, (card) => card.note)
  cards: CardEntity[];

  @Column({ type: 'bigint' })
  @CreateDateColumn()
  createdAt: number;

  @Column({ type: 'bigint' })
  @UpdateDateColumn()
  updatedAt: number;
}
