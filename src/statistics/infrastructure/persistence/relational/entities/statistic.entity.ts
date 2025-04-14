import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { DeckEntity } from '../../../../../decks/infrastructure/persistence/relational/entities/deck.entity';
import { CardEntity } from '../../../../../cards/infrastructure/persistence/relational/entities/card.entity';

/**
 * Сущность статистики для ORM (TypeORM)
 */
@Entity('statistics')
export class StatisticEntity extends EntityRelationalHelper {
  /**
   * Уникальный идентификатор
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Тип статистики
   */
  @Column()
  @Index()
  type: string;

  /**
   * Данные статистики в формате JSON
   */
  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  /**
   * Отношение к пользователю
   */
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'uid' })
  user: UserEntity;

  /**
   * ID пользователя
   */
  @Column()
  @Index()
  uid: number;

  /**
   * Отношение к колоде
   */
  @ManyToOne(() => DeckEntity, { nullable: true })
  @JoinColumn({ name: 'did' })
  deck?: DeckEntity;

  /**
   * ID колоды (может быть null)
   */
  @Column({ nullable: true })
  @Index()
  did?: number;

  /**
   * Отношение к карточке
   */
  @ManyToOne(() => CardEntity, { nullable: true })
  @JoinColumn({ name: 'cid' })
  card?: CardEntity;

  /**
   * ID карточки (может быть null)
   */
  @Column({ nullable: true })
  @Index()
  cid?: number;

  /**
   * Дата создания записи
   */
  @CreateDateColumn({ type: 'timestamp' })
  @Index()
  createdAt: Date;

  /**
   * Дата обновления записи
   */
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
