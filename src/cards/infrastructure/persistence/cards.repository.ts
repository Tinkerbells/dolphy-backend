import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Cards } from '../../domain/cards';

export abstract class CardsRepository {
  abstract create(
    data: Omit<Cards, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Cards>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Cards[]>;

  abstract findById(id: Cards['id']): Promise<NullableType<Cards>>;

  abstract findByIds(ids: Cards['id'][]): Promise<Cards[]>;

  abstract update(
    id: Cards['id'],
    payload: DeepPartial<Cards>,
  ): Promise<Cards | null>;

  abstract remove(id: Cards['id']): Promise<void>;
}
