import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { MarketDeck } from '../../domain/market-deck';

export abstract class MarketDeckRepository {
  abstract create(
    data: Omit<MarketDeck, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<MarketDeck>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<MarketDeck[]>;

  abstract findById(id: MarketDeck['id']): Promise<NullableType<MarketDeck>>;

  abstract findByIds(ids: MarketDeck['id'][]): Promise<MarketDeck[]>;

  abstract update(
    id: MarketDeck['id'],
    payload: DeepPartial<MarketDeck>,
  ): Promise<MarketDeck | null>;

  abstract remove(id: MarketDeck['id']): Promise<void>;
}
