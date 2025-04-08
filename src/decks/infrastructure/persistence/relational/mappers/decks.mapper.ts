import { Decks } from '../../../../domain/decks';
import { DecksEntity } from '../entities/decks.entity';

export class DecksMapper {
  static toDomain(raw: DecksEntity): Decks {
    const domainEntity = new Decks();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Decks): DecksEntity {
    const persistenceEntity = new DecksEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
