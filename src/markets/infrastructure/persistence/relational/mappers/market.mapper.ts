import { Market } from '../../../../domain/market';
import { MarketEntity } from '../entities/market.entity';

export class MarketMapper {
  static toDomain(raw: MarketEntity): Market {
    const domainEntity = new Market();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Market): MarketEntity {
    const persistenceEntity = new MarketEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
