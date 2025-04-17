import { RatingType, ReviewLog } from '../../../../domain/review-log';
import { ReviewLogEntity } from '../entities/review-log.entity';

export class ReviewLogMapper {
  static toDomain(raw: ReviewLogEntity): ReviewLog {
    const domainEntity = new ReviewLog();
    domainEntity.id = raw.id;
    domainEntity.cardId = raw.cardId;
    domainEntity.grade = raw.grade as RatingType;
    domainEntity.state = raw.state;
    domainEntity.due = raw.due;
    domainEntity.stability = raw.stability;
    domainEntity.difficulty = raw.difficulty;
    domainEntity.elapsed_days = raw.elapsed_days;
    domainEntity.last_elapsed_days = raw.last_elapsed_days;
    domainEntity.scheduled_days = raw.scheduled_days;
    domainEntity.review = raw.review;
    domainEntity.duration = raw.duration;
    domainEntity.deleted = raw.deleted;
    domainEntity.createdAt = raw.createdAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: ReviewLog): ReviewLogEntity {
    const persistenceEntity = new ReviewLogEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.cardId = domainEntity.cardId;
    persistenceEntity.grade = domainEntity.grade;
    persistenceEntity.state = domainEntity.state;
    persistenceEntity.due = domainEntity.due;
    persistenceEntity.stability = domainEntity.stability;
    persistenceEntity.difficulty = domainEntity.difficulty;
    persistenceEntity.elapsed_days = domainEntity.elapsed_days;
    persistenceEntity.last_elapsed_days = domainEntity.last_elapsed_days;
    persistenceEntity.scheduled_days = domainEntity.scheduled_days;
    persistenceEntity.review = domainEntity.review;
    persistenceEntity.duration = domainEntity.duration;
    persistenceEntity.deleted = domainEntity.deleted;
    persistenceEntity.createdAt = domainEntity.createdAt;

    return persistenceEntity;
  }
}
