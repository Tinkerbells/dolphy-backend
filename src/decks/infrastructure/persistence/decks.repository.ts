import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Decks } from '../../domain/decks';

export abstract class DecksRepository {
  abstract create(
    data: Omit<Decks, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Decks>;

  abstract findAllWithPagination({
    paginationOptions,
    ownerId,
    isPublic,
  }: {
    paginationOptions: IPaginationOptions;
    ownerId?: number;
    isPublic?: boolean;
  }): Promise<Decks[]>;

  abstract findById(id: Decks['id']): Promise<NullableType<Decks>>;

  abstract findByIds(ids: Decks['id'][]): Promise<Decks[]>;

  abstract findByOwner(ownerId: number): Promise<Decks[]>;

  abstract findPublic(paginationOptions: IPaginationOptions): Promise<Decks[]>;

  abstract update(
    id: Decks['id'],
    payload: DeepPartial<Decks>,
  ): Promise<Decks | null>;

  abstract incrementCardsCount(id: Decks['id']): Promise<Decks | null>;

  abstract decrementCardsCount(id: Decks['id']): Promise<Decks | null>;

  abstract remove(id: Decks['id']): Promise<void>;
}
