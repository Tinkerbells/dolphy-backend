import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DeckRepository } from './infrastructure/persistence/deck.repository';
import { Deck } from './domain/deck';
import { CreateDeckDto } from './dto/create-decks.dto';
import { UpdateDeckDto } from './dto/update-decks.dto';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { NullableType } from '../utils/types/nullable.type';
import { generatorParameters } from 'ts-fsrs';
import { FSRSParameters } from '../fsrs/domain/fsrs-parameters';
import { CardLimits } from '../fsrs/domain/card-limits';
import { IPaginationOptions } from '../utils/types/pagination-options';

/**
 * Сервис для работы с колодами карточек
 */
@Injectable()
export class DecksService {
  /**
   * Конструктор
   * @param deckRepository Репозиторий колод
   */
  constructor(private readonly deckRepository: DeckRepository) {}

  /**
   * Получить колоду по умолчанию для пользователя
   * Если колода не существует, создает ее
   * @param uid ID пользователя
   * @returns ID колоды по умолчанию
   */
  async getDefaultDeck(uid: number): Promise<number> {
    try {
      return await this.deckRepository.getDefaultDeck(uid);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ошибка при получении колоды по умолчанию',
      );
    }
  }

  /**
   * Получить список всех колод пользователя
   * @param uid ID пользователя
   * @param deleted Включать удаленные колоды (по умолчанию false)
   * @returns Массив колод
   */
  async findAll(uid: number, deleted: boolean = false): Promise<Deck[]> {
    try {
      return await this.deckRepository.findAll(uid, deleted);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ошибка при получении списка колод',
      );
    }
  }

  /**
   * Получить список колод с пагинацией
   * @param uid ID пользователя
   * @param options Опции пагинации
   * @param deleted Включать удаленные колоды (по умолчанию false)
   * @returns Массив колод
   */
  async findAllWithPagination({
    uid,
    paginationOptions,
    deleted = false,
  }: {
    uid: number;
    paginationOptions: IPaginationOptions;
    deleted?: boolean;
  }): Promise<Deck[]> {
    try {
      const allDecks = await this.deckRepository.findAll(uid, deleted);

      // Применяем пагинацию вручную
      const { page, limit } = paginationOptions;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      return allDecks.slice(startIndex, endIndex);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ошибка при получении списка колод с пагинацией',
      );
    }
  }

  /**
   * Получить колоду по ID
   * @param id ID колоды
   * @param uid ID пользователя
   * @returns Колода или null, если не найдена
   */
  async findById(id: number, uid: number): Promise<NullableType<Deck>> {
    try {
      const deck = await this.deckRepository.findById(id, uid);

      if (!deck) {
        throw new NotFoundException(`Колода с ID ${id} не найдена`);
      }

      return deck;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message || `Ошибка при получении колоды с ID ${id}`,
      );
    }
  }

  /**
   * Создать новую колоду
   * @param uid ID пользователя
   * @param dto DTO с данными для создания
   * @returns Созданная колода
   */
  async create(uid: number, dto: CreateDeckDto): Promise<Deck> {
    try {
      // Устанавливаем параметры FSRS по умолчанию, если не указаны
      const defaultParams: FSRSParameters = dto.fsrs || generatorParameters();

      // Устанавливаем лимиты карточек по умолчанию, если не указаны
      const defaultLimits: CardLimits = dto.card_limit || {
        new: 50,
        review: Number.MAX_SAFE_INTEGER,
        learning: Number.MAX_SAFE_INTEGER,
        suspended: 8,
      };

      // Создаем колоду
      return await this.deckRepository.create({
        uid,
        name: dto.name,
        description: dto.description || '',
        fsrs: defaultParams,
        card_limit: defaultLimits,
        deleted: false,
      });
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Ошибка при создании колоды',
      );
    }
  }

  /**
   * Обновить колоду
   * @param id ID колоды
   * @param uid ID пользователя
   * @param dto DTO с данными для обновления
   * @returns Обновленная колода или null, если не найдена
   */
  async update(
    id: number,
    uid: number,
    dto: UpdateDeckDto,
  ): Promise<NullableType<Deck>> {
    try {
      // Проверяем существование колоды
      const existingDeck = await this.deckRepository.findById(id, uid);

      if (!existingDeck) {
        throw new NotFoundException(`Колода с ID ${id} не найдена`);
      }

      // Создаем объект с обновленными данными
      const updateData: DeepPartial<Deck> = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.fsrs !== undefined) updateData.fsrs = dto.fsrs;
      if (dto.card_limit !== undefined) updateData.card_limit = dto.card_limit;

      // Обновляем колоду
      const updatedDeck = await this.deckRepository.update(id, updateData, uid);

      if (!updatedDeck) {
        throw new BadRequestException(`Не удалось обновить колоду с ID ${id}`);
      }

      return updatedDeck;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message || `Ошибка при обновлении колоды с ID ${id}`,
      );
    }
  }

  /**
   * Удалить колоду (мягкое удаление)
   * @param id ID колоды
   * @param uid ID пользователя
   * @returns true, если удаление успешно
   */
  async remove(id: number, uid: number): Promise<boolean> {
    try {
      // Проверяем существование колоды
      const existingDeck = await this.deckRepository.findById(id, uid);

      if (!existingDeck) {
        throw new NotFoundException(`Колода с ID ${id} не найдена`);
      }

      // Проверяем, не является ли колода колодой по умолчанию
      const defaultDeckId = await this.deckRepository.getDefaultDeck(uid);

      if (id === defaultDeckId) {
        throw new BadRequestException('Нельзя удалить колоду по умолчанию');
      }

      // Удаляем колоду (мягкое удаление)
      return await this.deckRepository.softDelete(id, uid);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException(
        error.message || `Ошибка при удалении колоды с ID ${id}`,
      );
    }
  }

  /**
   * Восстановить удаленную колоду
   * @param id ID колоды
   * @param uid ID пользователя
   * @returns Восстановленная колода или null, если не найдена
   */
  async restore(id: number, uid: number): Promise<NullableType<Deck>> {
    try {
      // Проверяем существование удаленной колоды
      const existingDeck = await this.deckRepository.findById(id, uid, true);

      if (!existingDeck) {
        throw new NotFoundException(`Колода с ID ${id} не найдена`);
      }

      if (!existingDeck.deleted) {
        // Колода уже восстановлена
        return existingDeck;
      }

      // Восстанавливаем колоду
      const updateData: DeepPartial<Deck> = {
        deleted: false,
      };

      return await this.deckRepository.update(id, updateData, uid);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message || `Ошибка при восстановлении колоды с ID ${id}`,
      );
    }
  }

  /**
   * Увеличить счетчик карточек в колоде
   * @param id ID колоды
   * @returns Обновленная колода или null, если не найдена
   */
  async incrementCardsCount(id: number): Promise<NullableType<Deck>> {
    try {
      // Проверяем существование колоды
      const existingDeck = await this.deckRepository.findById(id);

      if (!existingDeck) {
        throw new NotFoundException(`Колода с ID ${id} не найдена`);
      }

      // Увеличиваем счетчик карточек
      const updateData: DeepPartial<Deck> = {
        cardsCount: existingDeck.cardsCount + 1,
      };

      return await this.deckRepository.update(id, updateData);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `Ошибка при обновлении счетчика карточек в колоде с ID ${id}`,
      );
    }
  }

  /**
   * Уменьшить счетчик карточек в колоде
   * @param id ID колоды
   * @returns Обновленная колода или null, если не найдена
   */
  async decrementCardsCount(id: number): Promise<NullableType<Deck>> {
    try {
      // Проверяем существование колоды
      const existingDeck = await this.deckRepository.findById(id);

      if (!existingDeck) {
        throw new NotFoundException(`Колода с ID ${id} не найдена`);
      }

      // Убеждаемся, что счетчик не станет отрицательным
      const newCount = Math.max(0, existingDeck.cardsCount - 1);

      // Уменьшаем счетчик карточек
      const updateData: DeepPartial<Deck> = {
        cardsCount: newCount,
      };

      return await this.deckRepository.update(id, updateData);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        error.message ||
          `Ошибка при обновлении счетчика карточек в колоде с ID ${id}`,
      );
    }
  }
}
