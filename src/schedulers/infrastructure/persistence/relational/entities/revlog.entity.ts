import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { State, Grade } from 'ts-fsrs';
import { EntityRelationalHelper } from 'src/utils/relational-entity-helper';
import { CardEntity } from 'src/cards/infrastructure/persistence/relational/entities/card.entity';

@Entity('revlog')
export class RevlogEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  grade: Grade;

  @Column()
  state: State;

  @Column({ type: 'bigint' })
  due: number;

  @Column('float')
  stability: number;

  @Column('float')
  difficulty: number;

  @Column()
  elapsed_days: number;

  @Column()
  last_elapsed_days: number;

  @Column()
  scheduled_days: number;

  @Column({ type: 'bigint' })
  review: number;

  @Column({ default: 0 })
  duration: number;

  @Column({ default: 0 })
  offset: number;

  @Column({ default: false })
  deleted: boolean;

  @ManyToOne(() => CardEntity, (card) => card.revlogs)
  @JoinColumn({ name: 'cid' })
  card: CardEntity;

  @Column()
  cid: number;

  @Column()
  nid: number;

  @Column()
  did: number;

  @Column()
  uid: number;
}
