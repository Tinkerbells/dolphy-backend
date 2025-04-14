import { CardLimits } from 'src/fsrs/domain/card-limits';
import { FSRSParameters } from 'src/fsrs/domain/fsrs-parameters';
import { NoteEntity } from 'src/notes/infrastructure/persistence/relational/entities/note.entity';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
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

@Entity('deck')
export class DeckEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'jsonb' })
  fsrs: FSRSParameters;

  @Column({ type: 'jsonb' })
  card_limit: CardLimits;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'uid' })
  user: UserEntity;

  @Column()
  uid: number;

  @OneToMany(() => NoteEntity, (note) => note.deck)
  notes: NoteEntity[];

  @Column({ type: 'bigint' })
  @CreateDateColumn()
  created: number;

  @Column({ type: 'bigint' })
  @UpdateDateColumn()
  updated: number;
}
