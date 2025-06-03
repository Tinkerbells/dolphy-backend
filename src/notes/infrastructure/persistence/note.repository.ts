import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Note } from '../../domain/note';

export abstract class NoteRepository {
  abstract create(
    data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Note>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Note[]>;

  abstract findById(id: Note['id']): Promise<NullableType<Note>>;

  abstract findByIds(ids: Note['id'][]): Promise<Note[]>;

  abstract findByCardId(cardId: string): Promise<NullableType<Note>>;

  /**
   * Найти все заметки по ID колоды
   * @param deckId Идентификатор колоды
   * @returns Массив заметок, связанных с карточками указанной колоды
   */
  abstract findByDeckId(deckId: string): Promise<Note[]>;

  /**
   * Найти заметки по ID колоды с пагинацией
   * @param deckId Идентификатор колоды
   * @param paginationOptions Параметры пагинации
   * @returns Массив заметок с учетом пагинации
   */
  abstract findByDeckIdWithPagination({
    deckId,
    paginationOptions,
  }: {
    deckId: string;
    paginationOptions: IPaginationOptions;
  }): Promise<Note[]>;

  abstract update(
    id: Note['id'],
    payload: DeepPartial<Note>,
  ): Promise<Note | null>;

  abstract updateByCardId(
    cardId: string,
    payload: DeepPartial<Note>,
  ): Promise<Note | null>;

  abstract remove(id: Note['id']): Promise<void>;
}
