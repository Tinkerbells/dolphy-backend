import { Card } from 'src/cards/domain/cards';
import { CardEntity } from '../entities/card.entity';

export class CardMapper {
  static toDomain(entity: CardEntity): Card {
    const card = new Card();

    card.id = entity.id;
    card.front = entity.front;
    card.back = entity.back;
    card.hint = entity.hint;
    card.intervalStep = entity.intervalStep;
    card.nextReviewDate = entity.nextReviewDate;
    card.correctStreak = entity.correctStreak;
    card.incorrectStreak = entity.incorrectStreak;
    card.deckId = entity.deckId;
    card.state = entity.state;
    card.suspended = entity.suspended;
    card.deleted = entity.deleted;
    card.createdAt = entity.createdAt ? entity.createdAt.getTime() : Date.now();
    card.updatedAt = entity.updatedAt ? entity.updatedAt.getTime() : Date.now();

    return card;
  }

  static toPersistence(domain: Card): CardEntity {
    const entity = new CardEntity();

    if (domain.id) {
      entity.id = domain.id.toString();
    }
    entity.front = domain.front;
    entity.back = domain.back;
    entity.hint = domain.hint;
    entity.intervalStep = domain.intervalStep;
    entity.nextReviewDate = domain.nextReviewDate;
    entity.correctStreak = domain.correctStreak;
    entity.incorrectStreak = domain.incorrectStreak;
    entity.deckId = domain.deckId;
    entity.state = domain.state;
    entity.suspended = domain.suspended;
    entity.deleted = domain.deleted;

    return entity;
  }
}
