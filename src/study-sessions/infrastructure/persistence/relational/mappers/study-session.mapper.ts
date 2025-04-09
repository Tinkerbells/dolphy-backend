import { StudySession } from '../../../../domain/study-session';
import { StudySessionEntity } from '../entities/study-session.entity';
import { StudySessionCardMapper } from './study-session-card.mapper';

export class StudySessionMapper {
  static toDomain(raw: StudySessionEntity): StudySession {
    const domainEntity = new StudySession();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    domainEntity.deckId = raw.deckId;
    domainEntity.totalCards = raw.totalCards;
    domainEntity.cardsCompleted = raw.cardsCompleted;
    domainEntity.cardsCorrect = raw.cardsCorrect;
    domainEntity.isCompleted = raw.isCompleted;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    // Маппинг карточек, если они загружены
    if (raw.cards) {
      domainEntity.cards = raw.cards.map((card) =>
        StudySessionCardMapper.toDomain(card),
      );
    }

    return domainEntity;
  }

  static toPersistence(domainEntity: StudySession): StudySessionEntity {
    const persistenceEntity = new StudySessionEntity();

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.deckId = domainEntity.deckId;
    persistenceEntity.totalCards = domainEntity.totalCards;
    persistenceEntity.cardsCompleted = domainEntity.cardsCompleted;
    persistenceEntity.cardsCorrect = domainEntity.cardsCorrect;
    persistenceEntity.isCompleted = domainEntity.isCompleted;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
