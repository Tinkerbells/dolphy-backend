import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Fsrs } from '../../domain/fsrs';

export abstract class FsrsRepository {
  abstract create(
    data: Omit<Fsrs, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Fsrs>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Fsrs[]>;

  abstract findById(id: Fsrs['id']): Promise<NullableType<Fsrs>>;

  abstract findByIds(ids: Fsrs['id'][]): Promise<Fsrs[]>;

  abstract update(
    id: Fsrs['id'],
    payload: DeepPartial<Fsrs>,
  ): Promise<Fsrs | null>;

  abstract remove(id: Fsrs['id']): Promise<void>;
}
