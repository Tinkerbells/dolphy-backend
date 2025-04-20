import { MarketComment } from '../../../../domain/market-comment';
import { MarketCommentEntity } from '../entities/market-comment.entity';

export class MarketCommentMapper {
  static toDomain(raw: MarketCommentEntity): MarketComment {
    const domainEntity = new MarketComment();
    domainEntity.id = raw.id;
    domainEntity.marketDeckId = raw.marketDeckId;
    domainEntity.userId = raw.userId;
    domainEntity.text = raw.text;
    domainEntity.rating = raw.rating;
    domainEntity.deleted = raw.deleted;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: MarketComment): MarketCommentEntity {
    const persistenceEntity = new MarketCommentEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.marketDeckId = domainEntity.marketDeckId;
    persistenceEntity.userId = domainEntity.userId;
    persistenceEntity.text = domainEntity.text;
    persistenceEntity.rating = domainEntity.rating;
    persistenceEntity.deleted = domainEntity.deleted;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
