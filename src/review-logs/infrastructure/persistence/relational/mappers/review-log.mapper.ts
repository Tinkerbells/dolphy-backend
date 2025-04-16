import { ReviewLog } from '../../../../domain/review-log';
import { ReviewLogEntity } from '../entities/review-log.entity';

export class ReviewLogMapper {
  static toDomain(raw: ReviewLogEntity): ReviewLog {
    const domainEntity = new ReviewLog();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: ReviewLog): ReviewLogEntity {
    const persistenceEntity = new ReviewLogEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
