import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CardEntity } from 'src/cards/infrastructure/persistence/relational/entities/card.entity';

@Entity({
  name: 'note',
})
export class NoteEntity extends EntityRelationalHelper {
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

  @Column({ type: 'json', nullable: true })
  extend?: Record<string, any>;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
