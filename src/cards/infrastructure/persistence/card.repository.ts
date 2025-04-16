import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Card } from '../../domain/card';

export abstract class CardRepository {
  abstract create(
    data: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Card>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Card[]>;

  abstract findById(id: Card['id']): Promise<NullableType<Card>>;

  abstract findByIds(ids: Card['id'][]): Promise<Card[]>;

  abstract update(
    id: Card['id'],
    payload: DeepPartial<Card>,
  ): Promise<Card | null>;

  abstract remove(id: Card['id']): Promise<void>;
}
