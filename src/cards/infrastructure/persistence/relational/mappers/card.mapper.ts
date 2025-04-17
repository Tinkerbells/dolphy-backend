import { Card, StateType } from '../../../../domain/card';
import { CardEntity } from '../entities/card.entity';

export class CardMapper {
  static toDomain(raw: CardEntity): Card {
    const domainEntity = new Card();
    domainEntity.id = raw.id;
    domainEntity.due = raw.due;
    domainEntity.stability = raw.stability;
    domainEntity.difficulty = raw.difficulty;
    domainEntity.elapsed_days = raw.elapsed_days;
    domainEntity.scheduled_days = raw.scheduled_days;
    domainEntity.reps = raw.reps;
    domainEntity.lapses = raw.lapses;
    domainEntity.state = raw.state as StateType;
    domainEntity.last_review = raw.last_review;
    domainEntity.suspended = raw.suspended;
    domainEntity.userId = raw.userId;
    domainEntity.deleted = raw.deleted;
    domainEntity.createdAt = raw.createdAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Card): CardEntity {
    const persistenceEntity = new CardEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.due = domainEntity.due;
    persistenceEntity.stability = domainEntity.stability;
    persistenceEntity.difficulty = domainEntity.difficulty;
    persistenceEntity.elapsed_days = domainEntity.elapsed_days;
    persistenceEntity.scheduled_days = domainEntity.scheduled_days;
    persistenceEntity.reps = domainEntity.reps;
    persistenceEntity.lapses = domainEntity.lapses;
    persistenceEntity.state = domainEntity.state;
    persistenceEntity.last_review = domainEntity.last_review;
    persistenceEntity.suspended = domainEntity.suspended;
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.deleted = domainEntity.deleted;
    persistenceEntity.createdAt = domainEntity.createdAt;

    return persistenceEntity;
  }
}
