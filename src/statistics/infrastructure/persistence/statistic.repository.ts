import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Statistic } from '../../domain/statistic';

export abstract class StatisticRepository {
  abstract create(
    data: Omit<Statistic, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Statistic>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Statistic[]>;

  abstract findById(id: Statistic['id']): Promise<NullableType<Statistic>>;

  abstract findByIds(ids: Statistic['id'][]): Promise<Statistic[]>;

  abstract update(
    id: Statistic['id'],
    payload: DeepPartial<Statistic>,
  ): Promise<Statistic | null>;

  abstract remove(id: Statistic['id']): Promise<void>;
}
