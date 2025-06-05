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
@Index(['due', 'suspended', 'deleted'])
@Index(['cardId', 'deleted'])
@Index(['due', 'deleted'])
@Index(['state', 'deleted'])
export class FsrsCardEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index('IDX_FSRS_CARD_CARD_ID') // Отдельный индекс для cardId
  cardId: string;

  @OneToOne(() => CardEntity, {
    eager: false, // Контролируем загрузку вручную для оптимизации
    cascade: false,
  })
  @JoinColumn({ name: 'cardId' })
  card?: CardEntity;

  @Column({ type: 'timestamp' })
  @Index('IDX_FSRS_CARD_DUE') // Индекс для быстрого поиска по дате
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
  @Index('IDX_FSRS_CARD_STATE') // Индекс для поиска по состоянию
  state: string;

  @Column({ type: 'timestamp', nullable: true })
  last_review?: Date;

  @Column({ type: 'timestamp' })
  @Index('IDX_FSRS_CARD_SUSPENDED') // Индекс для проверки приостановки
  suspended: Date;

  @Column({ default: false })
  @Index('IDX_FSRS_CARD_DELETED') // Индекс для фильтрации удаленных
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
