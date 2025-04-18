import { Statistic } from '../../../../domain/statistic';
import { StatisticEntity } from '../entities/statistic.entity';

export class StatisticMapper {
  static toDomain(raw: StatisticEntity): Statistic {
    const domainEntity = new Statistic();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Statistic): StatisticEntity {
    const persistenceEntity = new StatisticEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
