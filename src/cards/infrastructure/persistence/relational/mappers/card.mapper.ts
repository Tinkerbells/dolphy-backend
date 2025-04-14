import { Card } from 'src/cards/domain/card';
import { CardEntity } from '../entities/card.entity';

export class CardMapper {
  static toDomain(entity: CardEntity): Card {
    const card = new Card();

    card.id = entity.id;
    card.due = entity.due;
    card.stability = entity.stability;
    card.difficulty = entity.difficulty;
    card.elapsed_days = entity.elapsed_days;
    card.scheduled_days = entity.scheduled_days;
    card.reps = entity.reps;
    card.lapses = entity.lapses;
    card.state = entity.state;
    card.last_review = entity.last_review;
    card.suspended = entity.suspended;
    card.deleted = entity.deleted;
    card.nid = entity.nid;
    card.did = entity.did;
    card.uid = entity.uid;
    card.createdAt = +entity.createdAt;
    card.updatedAt = +entity.updatedAt;

    return card;
  }

  static toPersistence(domain: Card): CardEntity {
    const entity = new CardEntity();

    entity.id = domain.id;
    entity.due = domain.due;
    entity.stability = domain.stability;
    entity.difficulty = domain.difficulty;
    entity.elapsed_days = domain.elapsed_days;
    entity.scheduled_days = domain.scheduled_days;
    entity.reps = domain.reps;
    entity.lapses = domain.lapses;
    entity.state = domain.state;
    entity.last_review = domain.last_review;
    entity.suspended = domain.suspended;
    entity.deleted = domain.deleted;
    entity.nid = domain.nid;
    entity.did = domain.did;
    entity.uid = domain.uid;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }
}
