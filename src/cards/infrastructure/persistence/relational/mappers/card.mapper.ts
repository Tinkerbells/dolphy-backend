import { Card } from '../../../../domain/card';
import { CardEntity } from '../entities/card.entity';

export class CardMapper {
  static toDomain(raw: CardEntity): Card {
    const domainEntity = new Card();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Card): CardEntity {
    const persistenceEntity = new CardEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
