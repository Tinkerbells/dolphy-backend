import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Card } from '../../domain/card';

export abstract class CardRepository {
  abstract create(data: Omit<Card, 'id' | 'createdAt'>): Promise<Card>;

  abstract findAllWithPagination({
    paginationOptions,
    userId,
    deckId,
  }: {
    paginationOptions: IPaginationOptions;
    userId?: string;
    deckId?: string;
  }): Promise<Card[]>;

  abstract findById(id: Card['id']): Promise<NullableType<Card>>;

  abstract findByIds(ids: Card['id'][]): Promise<Card[]>;

  abstract findByDeckId(deckId: string): Promise<Card[]>;

  abstract findDueCards(userId: string, now: Date): Promise<Card[]>;

  abstract findDueCardsByDeckId(deckId: string, now: Date): Promise<Card[]>;

  // Новые методы для работы с колодами
  abstract assignToDeck(cardId: string, deckId: string): Promise<Card | null>;
  // abstract removeFromDeck(cardId: string): Promise<Card | null>;

  abstract update(
    id: Card['id'],
    payload: DeepPartial<Card>,
  ): Promise<Card | null>;

  abstract remove(id: Card['id']): Promise<void>;
}
