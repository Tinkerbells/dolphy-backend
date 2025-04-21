import { MarketDeck } from '../../../../domain/market-deck';
import { MarketDeckEntity } from '../entities/market-deck.entity';

export class MarketDeckMapper {
  static toDomain(raw: MarketDeckEntity): MarketDeck {
    const domainEntity = new MarketDeck();
    domainEntity.id = raw.id;
    domainEntity.deckId = raw.deckId;
    domainEntity.authorId = raw.authorId;
    domainEntity.title = raw.title;
    domainEntity.description = raw.description;
    domainEntity.tags = raw.tags || [];
    domainEntity.downloadCount = raw.downloadCount;
    domainEntity.ratingBreakdown = raw.ratingBreakdown || {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };
    domainEntity.commentsCount = raw.commentsCount;
    domainEntity.cardsCount = raw.cardsCount;
    domainEntity.deleted = raw.deleted;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: MarketDeck): MarketDeckEntity {
    const persistenceEntity = new MarketDeckEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.deckId = domainEntity.deckId;
    persistenceEntity.authorId = domainEntity.authorId;
    persistenceEntity.title = domainEntity.title;
    persistenceEntity.description = domainEntity.description;
    persistenceEntity.tags = domainEntity.tags;
    persistenceEntity.downloadCount = domainEntity.downloadCount;
    persistenceEntity.ratingBreakdown = domainEntity.ratingBreakdown || {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };
    persistenceEntity.commentsCount = domainEntity.commentsCount;
    persistenceEntity.cardsCount = domainEntity.cardsCount;
    persistenceEntity.deleted = domainEntity.deleted;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
