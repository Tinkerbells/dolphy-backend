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
    domainEntity.isPublic = raw.isPublic;
    domainEntity.isCopyAllowed = raw.isCopyAllowed;
    domainEntity.downloadCount = raw.downloadCount;
    domainEntity.rating = raw.rating;
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
    persistenceEntity.isPublic = domainEntity.isPublic;
    persistenceEntity.isCopyAllowed = domainEntity.isCopyAllowed;
    persistenceEntity.downloadCount = domainEntity.downloadCount;
    persistenceEntity.rating = domainEntity.rating;
    persistenceEntity.commentsCount = domainEntity.commentsCount;
    persistenceEntity.cardsCount = domainEntity.cardsCount;
    persistenceEntity.deleted = domainEntity.deleted;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
