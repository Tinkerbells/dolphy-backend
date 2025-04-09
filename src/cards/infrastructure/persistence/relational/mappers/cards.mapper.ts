import { Cards } from '../../../../domain/cards';
import { CardsEntity } from '../entities/cards.entity';

export class CardsMapper {
  static toDomain(raw: CardsEntity): Cards {
    const domainEntity = new Cards();
    domainEntity.id = raw.id;
    domainEntity.front = raw.front;
    domainEntity.back = raw.back;
    domainEntity.hint = raw.hint;
    domainEntity.intervalStep = raw.intervalStep;
    domainEntity.nextReviewDate = raw.nextReviewDate;
    domainEntity.correctStreak = raw.correctStreak;
    domainEntity.incorrectStreak = raw.incorrectStreak;
    domainEntity.deckId = raw.deckId;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Cards): CardsEntity {
    const persistenceEntity = new CardsEntity();

    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.front = domainEntity.front;
    persistenceEntity.back = domainEntity.back;
    persistenceEntity.hint = domainEntity.hint;
    persistenceEntity.intervalStep = domainEntity.intervalStep;
    persistenceEntity.nextReviewDate = domainEntity.nextReviewDate;
    persistenceEntity.correctStreak = domainEntity.correctStreak;
    persistenceEntity.incorrectStreak = domainEntity.incorrectStreak;
    persistenceEntity.deckId = domainEntity.deckId;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;

    return persistenceEntity;
  }
}
