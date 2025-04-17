import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Deck } from '../../domain/deck';

export abstract class DeckRepository {
  abstract create(
    data: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Deck>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Deck[]>;

  abstract findById(id: Deck['id']): Promise<NullableType<Deck>>;

  abstract findByIds(ids: Deck['id'][]): Promise<Deck[]>;

  abstract findByUserId(userId: string): Promise<Deck[]>;

  abstract update(
    id: Deck['id'],
    payload: DeepPartial<Deck>,
  ): Promise<Deck | null>;

  abstract remove(id: Deck['id']): Promise<void>;
}
