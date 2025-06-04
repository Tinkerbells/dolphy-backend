import { Card } from '../../../../domain/card';
import { CardEntity } from '../entities/card.entity';

export class CardMapper {
  static toDomain(raw: CardEntity): Card {
    const domainEntity = new Card();
    domainEntity.id = raw.id;
    domainEntity.question = raw.question;
    domainEntity.answer = raw.answer;
    domainEntity.source = raw.source;
    domainEntity.metadata = raw.metadata;
    domainEntity.deckId = raw.deckId;
    domainEntity.userId = raw.userId;
    domainEntity.deleted = raw.deleted;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Card): CardEntity {
    const persistenceEntity = new CardEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.question = domainEntity.question;
    persistenceEntity.answer = domainEntity.answer;
    persistenceEntity.source = domainEntity.source;
    persistenceEntity.metadata = domainEntity.metadata;
    persistenceEntity.deckId = domainEntity.deckId;
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.deleted = domainEntity.deleted;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
