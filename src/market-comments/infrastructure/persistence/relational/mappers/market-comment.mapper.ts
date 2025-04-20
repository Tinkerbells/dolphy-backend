import { MarketComment } from '../../../../domain/market-comment';
import { MarketCommentEntity } from '../entities/market-comment.entity';

export class MarketCommentMapper {
  static toDomain(raw: MarketCommentEntity): MarketComment {
    const domainEntity = new MarketComment();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: MarketComment): MarketCommentEntity {
    const persistenceEntity = new MarketCommentEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
