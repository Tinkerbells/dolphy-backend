import { MarketDeck } from '../../../../domain/market-deck';
import { MarketDeckEntity } from '../entities/market-deck.entity';

export class MarketDeckMapper {
  static toDomain(raw: MarketDeckEntity): MarketDeck {
    const domainEntity = new MarketDeck();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: MarketDeck): MarketDeckEntity {
    const persistenceEntity = new MarketDeckEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
