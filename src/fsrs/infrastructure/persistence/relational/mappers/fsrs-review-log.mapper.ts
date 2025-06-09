import { FsrsReviewLog } from '../../../../domain/fsrs-review-log';
import { FsrsReviewLogEntity } from '../entities/fsrs-review-log.entity';

export class FsrsReviewLogMapper {
  static toDomain(raw: FsrsReviewLogEntity): FsrsReviewLog {
    const domainEntity = new FsrsReviewLog();
    domainEntity.id = raw.id;
    domainEntity.fsrsCardId = raw.fsrsCardId;
    domainEntity.rating = raw.rating;
    domainEntity.review = raw.review;
    domainEntity.state = raw.state;
    domainEntity.due = raw.due;
    domainEntity.stability = raw.stability;
    domainEntity.difficulty = raw.difficulty;
    domainEntity.elapsed_days = raw.elapsed_days;
    domainEntity.last_elapsed_days = raw.last_elapsed_days;
    domainEntity.scheduled_days = raw.scheduled_days;
    domainEntity.createdAt = raw.createdAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: FsrsReviewLog): FsrsReviewLogEntity {
    const persistenceEntity = new FsrsReviewLogEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.fsrsCardId = domainEntity.fsrsCardId;
    persistenceEntity.rating = domainEntity.rating;
    persistenceEntity.review = domainEntity.review;
    persistenceEntity.state = domainEntity.state;
    persistenceEntity.due = domainEntity.due;
    persistenceEntity.stability = domainEntity.stability;
    persistenceEntity.difficulty = domainEntity.difficulty;
    persistenceEntity.elapsed_days = domainEntity.elapsed_days;
    persistenceEntity.last_elapsed_days = domainEntity.last_elapsed_days;
    persistenceEntity.scheduled_days = domainEntity.scheduled_days;
    persistenceEntity.createdAt = domainEntity.createdAt;
    return persistenceEntity;
  }
}
