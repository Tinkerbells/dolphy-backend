import {
  Entity,
  CreateDateColumn,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CardEntity } from './card.entity';
import { DeckEntity } from '../../../../../decks/infrastructure/persistence/relational/entities/deck.entity';

@Entity({
  name: 'cards_to_decks',
})
export class CardsToDecksEntity extends EntityRelationalHelper {
  @PrimaryColumn()
  cardId: string;

  @PrimaryColumn()
  deckId: string;

  @ManyToOne(() => CardEntity, (card) => card.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cardId' })
  card: CardEntity;

  @ManyToOne(() => DeckEntity, (deck) => deck.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deckId' })
  deck: DeckEntity;

  @CreateDateColumn()
  createdAt: Date;
}
