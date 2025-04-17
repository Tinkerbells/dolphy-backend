import { CardContent } from '../../../../domain/card-content';
import { CardContentEntity } from '../entities/card-content.entity';

export class CardContentMapper {
  static toDomain(raw: CardContentEntity): CardContent {
    const domainEntity = new CardContent();
    domainEntity.id = raw.id;
    domainEntity.cardId = raw.cardId;
    domainEntity.question = raw.question;
    domainEntity.answer = raw.answer;
    domainEntity.source = raw.source;
    domainEntity.sourceId = raw.sourceId;
    domainEntity.extend = raw.extend;
    domainEntity.deleted = raw.deleted;
    domainEntity.createdAt = raw.createdAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: CardContent): CardContentEntity {
    const persistenceEntity = new CardContentEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.cardId = domainEntity.cardId;
    persistenceEntity.question = domainEntity.question;
    persistenceEntity.answer = domainEntity.answer;
    persistenceEntity.source = domainEntity.source;
    persistenceEntity.sourceId = domainEntity.sourceId;
    persistenceEntity.extend = domainEntity.extend;
    persistenceEntity.deleted = domainEntity.deleted;
    persistenceEntity.createdAt = domainEntity.createdAt;

    return persistenceEntity;
  }
}
