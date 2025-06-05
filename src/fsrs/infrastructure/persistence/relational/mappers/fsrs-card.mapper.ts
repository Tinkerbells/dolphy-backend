import { FsrsCard, FsrsCardWithContent } from '../../../../domain/fsrs-card';
import { FsrsCardEntity } from '../entities/fsrs-card.entity';

export class FsrsCardMapper {
  static toDomain(raw: FsrsCardEntity): FsrsCard {
    const domainEntity = new FsrsCard();
    domainEntity.id = raw.id;
    domainEntity.cardId = raw.cardId;
    domainEntity.due = raw.due;
    domainEntity.stability = raw.stability;
    domainEntity.difficulty = raw.difficulty;
    domainEntity.elapsed_days = raw.elapsed_days;
    domainEntity.scheduled_days = raw.scheduled_days;
    domainEntity.reps = raw.reps;
    domainEntity.lapses = raw.lapses;
    domainEntity.state = raw.state;
    domainEntity.last_review = raw.last_review;
    domainEntity.suspended = raw.suspended;
    domainEntity.deleted = raw.deleted;
    domainEntity.createdAt = raw.createdAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: FsrsCard): FsrsCardEntity {
    const persistenceEntity = new FsrsCardEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.cardId = domainEntity.cardId;
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
    persistenceEntity.deleted = domainEntity.deleted;
    persistenceEntity.createdAt = domainEntity.createdAt;

    return persistenceEntity;
  }

  static toFsrsCardWithContent(entity: FsrsCardEntity): FsrsCardWithContent {
    const fsrsCard = FsrsCardMapper.toDomain(entity);

    if (!entity.card) {
      throw new Error(`Card not found for FsrsCard ${entity.id}`);
    }

    return {
      ...fsrsCard,
      card: entity.card,
    } as FsrsCardWithContent;
  }
}
