import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { MarketComment } from '../../domain/market-comment';

export abstract class MarketCommentRepository {
  abstract create(
    data: Omit<MarketComment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<MarketComment>;

  abstract findAllWithPagination({
    paginationOptions,
    marketDeckId,
    userId,
  }: {
    paginationOptions: IPaginationOptions;
    marketDeckId?: string;
    userId?: string;
  }): Promise<MarketComment[]>;

  abstract findById(
    id: MarketComment['id'],
  ): Promise<NullableType<MarketComment>>;

  abstract findByIds(ids: MarketComment['id'][]): Promise<MarketComment[]>;

  abstract findByMarketDeckId(marketDeckId: string): Promise<MarketComment[]>;

  abstract findByUserIdAndMarketDeckId(
    userId: string,
    marketDeckId: string,
  ): Promise<NullableType<MarketComment>>;

  abstract countByMarketDeckId(marketDeckId: string): Promise<number>;

  abstract getAverageRatingByMarketDeckId(
    marketDeckId: string,
  ): Promise<number>;

  abstract update(
    id: MarketComment['id'],
    payload: DeepPartial<MarketComment>,
  ): Promise<MarketComment | null>;

  abstract remove(id: MarketComment['id']): Promise<void>;
}
