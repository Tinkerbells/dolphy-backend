import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateCardsDto } from './dto/create-cards.dto';
import { UpdateCardsDto } from './dto/update-cards.dto';
import { CardsRepository } from './infrastructure/persistence/card.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Cards } from './domain/card';
import { DecksService } from '../decks/decks.service';

@Injectable()
export class CardsService {
  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly decksService: DecksService,
  ) {}

  async create(createCardsDto: CreateCardsDto): Promise<Cards> {
    // Проверяем существование колоды
    await this.decksService.findById(createCardsDto.deckId);

    // Создаем карточку
    const card = await this.cardsRepository.create({
      front: createCardsDto.front,
      back: createCardsDto.back,
      hint: createCardsDto.hint,
      intervalStep: 0,
      correctStreak: 0,
      incorrectStreak: 0,
      deckId: createCardsDto.deckId,
    });

    // Увеличиваем счетчик карточек в колоде
    await this.decksService.incrementCardsCount(createCardsDto.deckId);

    return card;
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Cards[]> {
    return this.cardsRepository.findAllWithPagination({
      paginationOptions,
    });
  }

  async findById(id: Cards['id']): Promise<Cards> {
    const card = await this.cardsRepository.findById(id);
    if (!card) {
      throw new NotFoundException(`Карточка с ID ${id} не найдена`);
    }
    return card;
  }

  findByIds(ids: Cards['id'][]): Promise<Cards[]> {
    return this.cardsRepository.findByIds(ids);
  }

  async findByDeckId(deckId: string): Promise<Cards[]> {
    // Проверяем существование колоды
    await this.decksService.findById(deckId);

    return this.cardsRepository.findByDeckId(deckId);
  }

  async findByDeckIdWithPagination({
    deckId,
    paginationOptions,
  }: {
    deckId: string;
    paginationOptions: IPaginationOptions;
  }): Promise<Cards[]> {
    // Проверяем существование колоды
    await this.decksService.findById(deckId);

    return this.cardsRepository.findByDeckIdWithPagination({
      deckId,
      paginationOptions,
    });
  }

  async findDueCards(userId: number, limit: number): Promise<Cards[]> {
    return this.cardsRepository.findDueCards(userId, limit);
  }

  async update(
    id: Cards['id'],
    updateCardsDto: UpdateCardsDto,
  ): Promise<Cards> {
    const card = await this.cardsRepository.findById(id);
    if (!card) {
      throw new NotFoundException(`Карточка с ID ${id} не найдена`);
    }

    // Если меняется колода, проверяем на существование новой колоды
    if (updateCardsDto.deckId && updateCardsDto.deckId !== card.deckId) {
      await this.decksService.findById(updateCardsDto.deckId);

      // Уменьшаем счетчик карточек в старой колоде
      await this.decksService.decrementCardsCount(card.deckId);

      // Увеличиваем счетчик карточек в новой колоде
      await this.decksService.incrementCardsCount(updateCardsDto.deckId);
    }

    const updatedCard = await this.cardsRepository.update(id, updateCardsDto);
    if (!updatedCard) {
      throw new BadRequestException(`Не удалось обновить карточку с ID ${id}`);
    }

    return updatedCard;
  }

  async recordAnswer(id: Cards['id'], isCorrect: boolean): Promise<Cards> {
    const card = await this.cardsRepository.findById(id);
    if (!card) {
      throw new NotFoundException(`Карточка с ID ${id} не найдена`);
    }

    // Рассчитываем дату следующего повторения по алгоритму интервального повторения
    const now = new Date();
    let nextReviewDate: Date;

    if (isCorrect) {
      // Алгоритм для правильного ответа: увеличивающийся интервал
      // Базовый интервал: 1 день, 3 дня, 7 дней, 14 дней, 30 дней...
      const intervalMultiplier = Math.max(1, 2 ** card.intervalStep);
      nextReviewDate = new Date(
        now.getTime() + intervalMultiplier * 24 * 60 * 60 * 1000,
      );

      const updatedCard = await this.cardsRepository.recordCorrectAnswer(
        id,
        nextReviewDate,
      );
      if (!updatedCard) {
        throw new BadRequestException(
          `Не удалось обновить данные ответа для карточки с ID ${id}`,
        );
      }
      return updatedCard;
    } else {
      // Алгоритм для неправильного ответа: сброс интервала
      // Повторить через 10 минут
      nextReviewDate = new Date(now.getTime() + 10 * 60 * 1000);

      const updatedCard = await this.cardsRepository.recordIncorrectAnswer(
        id,
        nextReviewDate,
      );
      if (!updatedCard) {
        throw new BadRequestException(
          `Не удалось обновить данные ответа для карточки с ID ${id}`,
        );
      }
      return updatedCard;
    }
  }

  async remove(id: Cards['id']): Promise<void> {
    const card = await this.cardsRepository.findById(id);
    if (!card) {
      throw new NotFoundException(`Карточка с ID ${id} не найдена`);
    }

    // Уменьшаем счетчик карточек в колоде
    await this.decksService.decrementCardsCount(card.deckId);

    return this.cardsRepository.remove(id);
  }
}
