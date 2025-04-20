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
import { MarketDeckEntity } from './market-deck.entity';

@Entity({
  name: 'market_comment',
})
export class MarketCommentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  marketDeckId: string;

  @ManyToOne(() => MarketDeckEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'marketDeckId' })
  marketDeck: MarketDeckEntity;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
