import { Cards } from 'src/cards/domain/cards';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';

export abstract class CardRepository {
  abstract create(
    data: Omit<Cards, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Cards>;

  abstract findById(id: Cards['id']): Promise<NullableType<Cards>>;

  abstract findByIds(ids: Cards['id'][]): Promise<Cards[]>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Cards[]>;

  abstract findByDeckId(deckId: string): Promise<Cards[]>;

  abstract findByDeckIdWithPagination({
    deckId,
    paginationOptions,
  }: {
    deckId: string;
    paginationOptions: IPaginationOptions;
  }): Promise<Cards[]>;

  abstract update(id: Cards['id'], data: DeepPartial<Cards>): Promise<Cards>;

  abstract recordCorrectAnswer(
    id: Cards['id'],
    nextReviewDate: Date,
  ): Promise<Cards>;

  abstract recordIncorrectAnswer(
    id: Cards['id'],
    nextReviewDate: Date,
  ): Promise<Cards>;

  abstract remove(id: Cards['id']): Promise<void>;

  abstract findDueCards(userId: number, limit: number): Promise<Cards[]>;
}
