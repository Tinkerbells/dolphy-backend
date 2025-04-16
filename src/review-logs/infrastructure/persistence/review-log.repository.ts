import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { ReviewLog } from '../../domain/review-log';

export abstract class ReviewLogRepository {
  abstract create(
    data: Omit<ReviewLog, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ReviewLog>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<ReviewLog[]>;

  abstract findById(id: ReviewLog['id']): Promise<NullableType<ReviewLog>>;

  abstract findByIds(ids: ReviewLog['id'][]): Promise<ReviewLog[]>;

  abstract update(
    id: ReviewLog['id'],
    payload: DeepPartial<ReviewLog>,
  ): Promise<ReviewLog | null>;

  abstract remove(id: ReviewLog['id']): Promise<void>;
}
