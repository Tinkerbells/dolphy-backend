import { Deck } from 'src/decks/domain/deck';
import { DeepPartial } from 'src/utils/types/deep-partial.type';
import { NullableType } from 'src/utils/types/nullable.type';

export abstract class DeckRepository {
  /**
   * Создать новую колоду
   * @param data Данные для создания
   */
  abstract create(
    data: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'cardsCount'>,
  ): Promise<Deck>;

  /**
   * Найти колоду по ID
   * @param id ID колоды
   * @param uid ID пользователя (опционально)
   * @param includeDeleted Включать удаленные колоды (опционально)
   */
  abstract findById(
    id: Deck['id'],
    uid?: number,
    includeDeleted?: boolean,
  ): Promise<NullableType<Deck>>;

  /**
   * Найти все колоды пользователя
   * @param uid ID пользователя
   * @param deleted Включать удаленные колоды (опционально)
   */
  abstract findAll(uid: number, deleted?: boolean): Promise<Deck[]>;

  /**
   * Обновить колоду
   * @param id ID колоды
   * @param data Данные для обновления
   * @param uid ID пользователя (опционально)
   */
  abstract update(
    id: Deck['id'],
    data: DeepPartial<Deck>,
    uid?: number,
  ): Promise<NullableType<Deck>>;

  /**
   * Мягкое удаление колоды
   * @param id ID колоды
   * @param uid ID пользователя (опционально)
   */
  abstract softDelete(id: Deck['id'], uid?: number): Promise<boolean>;

  /**
   * Получить ID колоды по умолчанию для пользователя
   * Если колода не существует, создает ее
   * @param uid ID пользователя
   */
  abstract getDefaultDeck(uid: number): Promise<number>;
}
