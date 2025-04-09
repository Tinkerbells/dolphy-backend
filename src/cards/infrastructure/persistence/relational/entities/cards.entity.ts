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
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { DecksEntity } from '../../../../../decks/infrastructure/persistence/relational/entities/decks.entity';

@Entity({
  name: 'cards',
})
export class CardsEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  front: string;

  @Column({ type: 'text' })
  back: string;

  @Column({ type: 'text', nullable: true })
  hint?: string;

  @Column({ default: 0 })
  intervalStep: number;

  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate?: Date;

  @Column({ default: 0 })
  correctStreak: number;

  @Column({ default: 0 })
  incorrectStreak: number;

  @ManyToOne(() => DecksEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deckId' })
  deck: DecksEntity;

  @Column({ type: 'uuid' })
  deckId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
