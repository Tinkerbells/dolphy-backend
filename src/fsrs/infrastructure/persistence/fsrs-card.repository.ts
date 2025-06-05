import { User } from 'src/users/domain/user';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { FsrsCard, FsrsCardWithContent } from '../../domain/fsrs-card';

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
   * ОПТИМИЗИРОВАННЫЕ методы с JOIN запросами
   * Возвращают FsrsCardWithContent чтобы избежать дополнительных запросов
   */

  /**
   * Найти все карточки готовые к повторению для пользователя
   * Использует JOIN для получения Card данных за один запрос
   */
  abstract findDueCards(
    userId: User['id'],
    now: Date,
  ): Promise<FsrsCardWithContent[]>;

  /**
   * Найти карточки готовые к повторению из конкретной колоды
   * Использует JOIN для получения Card данных за один запрос
   */
  abstract findDueCardsByDeckId(
    deckId: string,
    now: Date,
  ): Promise<FsrsCardWithContent[]>;

  /**
   * НОВЫЕ ОПТИМИЗИРОВАННЫЕ методы
   */

  /**
   * Найти карточки по состоянию с пагинацией
   * Включает Card данные через JOIN
   */
  abstract findByState(
    state: string,
    paginationOptions: IPaginationOptions,
    userId?: string,
  ): Promise<FsrsCardWithContent[]>;

  /**
   * Получить статистику по состояниям карточек пользователя
   * Оптимизированный запрос с GROUP BY
   */
  abstract getStateStatistics(userId: string): Promise<Record<string, number>>;

  /**
   * Найти карточки которые будут готовы к повторению в ближайшие дни
   * Полезно для планирования обучения
   */
  abstract findUpcomingDueCards(
    userId: string,
    days?: number,
  ): Promise<FsrsCardWithContent[]>;

  /**
   * Пакетное обновление для оптимизации производительности
   * Позволяет обновить множество карточек за одну транзакцию
   */
  abstract batchUpdate(
    updates: Array<{ id: string; data: Partial<FsrsCard> }>,
  ): Promise<void>;

  abstract update(
    id: FsrsCard['id'],
    payload: DeepPartial<FsrsCard>,
  ): Promise<FsrsCard | null>;

  abstract remove(id: FsrsCard['id']): Promise<void>;
}
