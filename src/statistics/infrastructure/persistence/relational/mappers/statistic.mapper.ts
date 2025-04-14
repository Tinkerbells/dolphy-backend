import { Statistic } from '../../../../domain/statistic';
import { StatisticEntity } from '../entities/statistic.entity';

/**
 * Маппер для преобразования между доменной сущностью и сущностью ORM
 */
export class StatisticMapper {
  /**
   * Преобразовать ORM сущность в доменную сущность
   * @param entity ORM сущность
   * @returns Доменная сущность
   */
  static toDomain(entity: StatisticEntity): Statistic {
    const statistic = new Statistic();
    statistic.id = entity.id;
    statistic.uid = entity.uid;
    statistic.did = entity.did;
    statistic.cid = entity.cid;
    statistic.type = entity.type;
    statistic.data = entity.data;
    statistic.createdAt = entity.createdAt.getTime();
    statistic.updatedAt = entity.updatedAt.getTime();

    return statistic;
  }

  /**
   * Преобразовать доменную сущность в ORM сущность
   * @param domain Доменная сущность
   * @returns ORM сущность
   */
  static toPersistence(domain: Statistic): StatisticEntity {
    const entity = new StatisticEntity();

    if (domain.id) {
      entity.id = domain.id;
    }

    entity.uid = domain.uid;
    entity.did = domain.did;
    entity.cid = domain.cid;
    entity.type = domain.type;
    entity.data = domain.data;

    if (domain.createdAt) {
      entity.createdAt = new Date(domain.createdAt);
    }

    if (domain.updatedAt) {
      entity.updatedAt = new Date(domain.updatedAt);
    }

    return entity;
  }
}
