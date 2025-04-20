import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'market_deck',
})
export class MarketDeckEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deckId: string;

  @Column()
  authorId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ default: true })
  isPublic: boolean;

  @Column({ default: true })
  isCopyAllowed: boolean;

  @Column({ default: 0 })
  downloadCount: number;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ default: 0 })
  commentsCount: number;

  @Column({ default: 0 })
  cardsCount: number;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
