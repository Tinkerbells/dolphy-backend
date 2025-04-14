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
import { State } from 'ts-fsrs';
import { EntityRelationalHelper } from 'src/utils/relational-entity-helper';
import { NoteEntity } from 'src/notes/infrastructure/persistence/relational/entities/note.entity';
import { RevlogEntity } from 'src/schedulers/infrastructure/persistence/relational/entities/revlog.entity';

@Entity('cards')
export class CardEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  due: number;

  @Column('float')
  stability: number;

  @Column('float')
  difficulty: number;

  @Column()
  elapsed_days: number;

  @Column()
  scheduled_days: number;

  @Column()
  reps: number;

  @Column()
  lapses: number;

  @Column({
    type: 'int',
    enum: State,
    default: State.New,
  })
  state: State;

  @Column({ type: 'bigint', nullable: true })
  last_review: number | null;

  @Column({ default: false })
  suspended: boolean;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => NoteEntity, (note) => note.cards)
  @JoinColumn({ name: 'nid' })
  note: NoteEntity;

  @Column()
  nid: number;

  @Column()
  did: number;

  @Column()
  uid: number;

  @OneToMany(() => RevlogEntity, (revlog) => revlog.card)
  revlogs: RevlogEntity[];

  @Column({ type: 'bigint' })
  @CreateDateColumn()
  created: number;

  @Column({ type: 'bigint' })
  @UpdateDateColumn()
  updated: number;
}
