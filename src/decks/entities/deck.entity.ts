import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/infrastructure/persistence/relational/entities/user.entity';
import { Card } from '../../cards/entities/card.entity';
import { EntityRelationalHelper } from '../../utils/relational-entity-helper';

@Entity('deck')
export class Deck extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: 0 })
  cardsCount: number;

  @ManyToOne(() => UserEntity, { eager: true })
  owner: UserEntity;

  @OneToMany(() => Card, (card) => card.deck)
  cards: Card[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
