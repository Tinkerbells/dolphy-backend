import { Deck } from 'src/decks/domain/deck';
import { DeckEntity } from '../entities/deck.entity';

export class DeckMapper {
  static toDomain(entity: DeckEntity): Deck {
    const deck = new Deck();

    deck.id = entity.id;
    deck.name = entity.name;
    deck.description = entity.description;
    deck.fsrs = entity.fsrs;
    deck.card_limit = entity.card_limit;
    deck.deleted = entity.deleted;
    deck.uid = entity.uid;
    deck.created = +entity.created;
    deck.updated = +entity.updated;

    return deck;
  }

  static toPersistence(domain: Deck): DeckEntity {
    const entity = new DeckEntity();

    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.fsrs = domain.fsrs;
    entity.card_limit = domain.card_limit;
    entity.deleted = domain.deleted;
    entity.uid = domain.uid;
    entity.created = domain.created;
    entity.updated = domain.updated;

    return entity;
  }
}
