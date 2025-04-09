import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Cards } from '../../domain/cards';

export abstract class CardsRepository {
  abstract create(
    data: Omit<Cards, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Cards>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Cards[]>;

  abstract findById(id: Cards['id']): Promise<NullableType<Cards>>;

  abstract findByIds(ids: Cards['id'][]): Promise<Cards[]>;

  abstract findByDeckId(deckId: string): Promise<Cards[]>;

  abstract findByDeckIdWithPagination({
    deckId,
    paginationOptions,
  }: {
    deckId: string;
    paginationOptions: IPaginationOptions;
  }): Promise<Cards[]>;

  abstract findDueCards(userId: number, limit: number): Promise<Cards[]>;

  abstract update(
    id: Cards['id'],
    payload: DeepPartial<Cards>,
  ): Promise<Cards | null>;

  abstract recordCorrectAnswer(
    id: Cards['id'],
    nextReviewDate: Date,
  ): Promise<Cards | null>;

  abstract recordIncorrectAnswer(
    id: Cards['id'],
    nextReviewDate: Date,
  ): Promise<Cards | null>;

  abstract remove(id: Cards['id']): Promise<void>;
}
