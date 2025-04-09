import { Decks } from '../../../../domain/decks';
import { DecksEntity } from '../entities/decks.entity';

export class DecksMapper {
  static toDomain(raw: DecksEntity): Decks {
    const domainEntity = new Decks();
    domainEntity.id = raw.id;
    domainEntity.title = raw.title;
    domainEntity.description = raw.description;
    domainEntity.isPublic = raw.isPublic;
    domainEntity.cardsCount = raw.cardsCount;
    domainEntity.ownerId = raw.ownerId;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Decks): DecksEntity {
    const persistenceEntity = new DecksEntity();

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.title = domainEntity.title;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.isPublic = domainEntity.isPublic;
    persistenceEntity.cardsCount = domainEntity.cardsCount;
    persistenceEntity.ownerId = domainEntity.ownerId;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;

    return persistenceEntity;
  }
}
