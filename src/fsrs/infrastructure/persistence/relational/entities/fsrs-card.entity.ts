import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CardEntity } from '../../../../../cards/infrastructure/persistence/relational/entities/card.entity';

@Entity({
  name: 'fsrs_card',
})
export class FsrsCardEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  cardId: string;

  @OneToOne(() => CardEntity)
  @JoinColumn({ name: 'cardId' })
  card: CardEntity;

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

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
