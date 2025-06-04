import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { FsrsCard } from '../../domain/fsrs-card';

export abstract class FsrsCardRepository {
  abstract create(data: Omit<FsrsCard, 'id' | 'createdAt'>): Promise<FsrsCard>;

  abstract findAllWithPagination({
    paginationOptions,
    deckId,
  }: {
    paginationOptions: IPaginationOptions;
    deckId?: string;
  }): Promise<FsrsCard[]>;

  abstract findById(id: FsrsCard['id']): Promise<NullableType<FsrsCard>>;

  abstract findByCardId(cardId: string): Promise<NullableType<FsrsCard>>;

  abstract findByCardIds(cardIds: string[]): Promise<FsrsCard[]>;

  /**
   * Найти все карточки готовые к повторению для пользователя
   */
  abstract findDueCards(userId: string, now: Date): Promise<FsrsCard[]>;

  /**
   * Найти карточки готовые к повторению из конкретной колоды
   */
  abstract findDueCardsByDeckId(deckId: string, now: Date): Promise<FsrsCard[]>;

  abstract update(
    id: FsrsCard['id'],
    payload: DeepPartial<FsrsCard>,
  ): Promise<FsrsCard | null>;

  abstract remove(id: FsrsCard['id']): Promise<void>;
}
