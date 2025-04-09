import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { DecksEntity } from '../../../../../decks/infrastructure/persistence/relational/entities/decks.entity';
import { StudySessionCardEntity } from './study-session-card.entity';

@Entity({
  name: 'study_session',
})
export class StudySessionEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  totalCards: number;

  @Column({ default: 0 })
  cardsCompleted: number;

  @Column({ default: 0 })
  cardsCorrect: number;

  @Column({ default: false })
  isCompleted: boolean;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => DecksEntity)
  @JoinColumn({ name: 'deckId' })
  deck: DecksEntity;

  @Column({ nullable: true })
  deckId: string;

  @OneToMany(() => StudySessionCardEntity, (card) => card.session)
  cards: StudySessionCardEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
