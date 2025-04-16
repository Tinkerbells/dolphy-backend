import { Deck } from '../../../../domain/deck';
import { DeckEntity } from '../entities/deck.entity';

export class DeckMapper {
  static toDomain(raw: DeckEntity): Deck {
    const domainEntity = new Deck();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Deck): DeckEntity {
    const persistenceEntity = new DeckEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
