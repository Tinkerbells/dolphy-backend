import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CardEntity } from './card.entity';

@Entity({
  name: 'card_content',
})
export class CardContentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cardId: string;

  @OneToOne(() => CardEntity)
  @JoinColumn({ name: 'cardId' })
  card: CardEntity;

  @Column()
  question: string;

  @Column()
  answer: string;

  @Column({ default: '' })
  source: string;

  @Column({ nullable: true })
  sourceId?: string;

  @Column({ type: 'json', nullable: true })
  extend?: Record<string, any>;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
