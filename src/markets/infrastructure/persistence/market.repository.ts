import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Market } from '../../domain/market';

export abstract class MarketRepository {
  abstract create(
    data: Omit<Market, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Market>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Market[]>;

  abstract findById(id: Market['id']): Promise<NullableType<Market>>;

  abstract findByIds(ids: Market['id'][]): Promise<Market[]>;

  abstract update(
    id: Market['id'],
    payload: DeepPartial<Market>,
  ): Promise<Market | null>;

  abstract remove(id: Market['id']): Promise<void>;
}
