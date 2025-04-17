import { Deck } from '../../../../domain/deck';
import { DeckEntity } from '../entities/deck.entity';

export class DeckMapper {
  static toDomain(raw: DeckEntity): Deck {
    const domainEntity = new Deck();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.description = raw.description;
    domainEntity.deleted = raw.deleted;
    domainEntity.userId = raw.userId;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Deck): DeckEntity {
    const persistenceEntity = new DeckEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.deleted = domainEntity.deleted;
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
