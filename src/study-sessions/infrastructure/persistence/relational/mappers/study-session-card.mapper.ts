import { StudySessionCard } from '../../../../domain/study-session-card';
import { StudySessionCardEntity } from '../entities/study-session-card.entity';

export class StudySessionCardMapper {
  static toDomain(raw: StudySessionCardEntity): StudySessionCard {
    const domainEntity = new StudySessionCard();
    domainEntity.id = raw.id;
    domainEntity.sessionId = raw.sessionId;
    domainEntity.cardId = raw.cardId;
    domainEntity.status = raw.status;
    domainEntity.interval = raw.interval;
    domainEntity.easeFactor = raw.easeFactor;
    domainEntity.consecutiveCorrect = raw.consecutiveCorrect;
    domainEntity.dueDate = raw.dueDate;
    domainEntity.isCompleted = raw.isCompleted;
    domainEntity.attempts = raw.attempts;
    domainEntity.lastReviewedAt = raw.lastReviewedAt;
    domainEntity.lastAnswer = raw.lastAnswer;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: StudySessionCard): StudySessionCardEntity {
    const persistenceEntity = new StudySessionCardEntity();

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.sessionId = domainEntity.sessionId;
    persistenceEntity.cardId = domainEntity.cardId;
    persistenceEntity.status = domainEntity.status;
    persistenceEntity.interval = domainEntity.interval;
    persistenceEntity.easeFactor = domainEntity.easeFactor;
    persistenceEntity.consecutiveCorrect = domainEntity.consecutiveCorrect;
    persistenceEntity.dueDate = domainEntity.dueDate;
    persistenceEntity.isCompleted = domainEntity.isCompleted;
    persistenceEntity.attempts = domainEntity.attempts;
    persistenceEntity.lastReviewedAt = domainEntity.lastReviewedAt;
    persistenceEntity.lastAnswer = domainEntity.lastAnswer;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
