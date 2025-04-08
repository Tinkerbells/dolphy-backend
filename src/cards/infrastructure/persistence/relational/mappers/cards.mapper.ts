import { Cards } from '../../../../domain/cards';
import { CardsEntity } from '../entities/cards.entity';

export class CardsMapper {
  static toDomain(raw: CardsEntity): Cards {
    const domainEntity = new Cards();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Cards): CardsEntity {
    const persistenceEntity = new CardsEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
