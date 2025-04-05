import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { DecksService } from '../decks/decks.service';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardsRepository: Repository<Card>,
    private readonly decksService: DecksService,
  ) {}

  // Создание новой карточки
  async create(createCardDto: CreateCardDto, userId: number): Promise<Card> {
    // Проверяем, существует ли колода и принадлежит ли она пользователю
    const deck = await this.decksService.findOne(createCardDto.deckId);

    if (deck.owner.id !== userId) {
      throw new ForbiddenException('Вы не являетесь владельцем этой колоды');
    }

    // Создаем карточку
    const card = this.cardsRepository.create({
      ...createCardDto,
      deck: { id: createCardDto.deckId },
    });

    const savedCard = await this.cardsRepository.save(card);

    // Обновляем счетчик карточек в колоде
    await this.decksService.updateCardsCount(createCardDto.deckId);

    return savedCard;
  }

  // Получение всех карточек в колоде
  async findByDeck(deckId: string): Promise<Card[]> {
    return this.cardsRepository.find({
      where: { deck: { id: deckId } },
      order: { updatedAt: 'DESC' },
    });
  }

  // Получение карточек для изучения
  async getCardsForStudy(deckId: string, userId: number): Promise<Card[]> {
    // Проверяем, существует ли колода
    const deck = await this.decksService.findOne(deckId);

    // Проверяем, является ли колода публичной или принадлежит пользователю
    if (!deck.isPublic && deck.owner.id !== userId) {
      throw new ForbiddenException('У вас нет доступа к этой колоде');
    }

    // Получаем карточки, которые нужно повторить (текущая дата >= nextReviewDate или nextReviewDate = null)
    const currentDate = new Date();

    return this.cardsRepository.find({
      where: [
        { deck: { id: deckId }, nextReviewDate: LessThanOrEqual(currentDate) },
        { deck: { id: deckId }, nextReviewDate: undefined },
      ],
      order: { intervalStep: 'ASC', updatedAt: 'ASC' },
      take: 20, // Ограничиваем количество карточек для изучения
    });
  }

  // Получение карточки по ID
  async findOne(id: string): Promise<Card> {
    const card = await this.cardsRepository.findOne({
      where: { id },
      relations: ['deck', 'deck.owner'],
    });

    if (!card) {
      throw new NotFoundException(`Карточка с ID ${id} не найдена`);
    }

    return card;
  }

  // Обновление карточки
  async update(
    id: string,
    updateCardDto: UpdateCardDto,
    userId: number,
  ): Promise<Card> {
    const card = await this.findOne(id);

    // Проверяем, что пользователь является владельцем колоды
    if (card.deck.owner.id !== userId) {
      throw new ForbiddenException('Вы не являетесь владельцем этой колоды');
    }

    // Если меняется колода
    if (updateCardDto.deckId && updateCardDto.deckId !== card.deck.id) {
      // Проверяем существование целевой колоды и права на неё
      const targetDeck = await this.decksService.findOne(updateCardDto.deckId);

      if (targetDeck.owner.id !== userId) {
        throw new ForbiddenException(
          'Вы не являетесь владельцем целевой колоды',
        );
      }

      // Обновляем счетчики карточек в обеих колодах
      const oldDeckId = card.deck.id;
      await this.cardsRepository.update(id, {
        ...updateCardDto,
        deck: { id: updateCardDto.deckId },
      });

      await this.decksService.updateCardsCount(oldDeckId);
      await this.decksService.updateCardsCount(updateCardDto.deckId);
    } else {
      // Если колода не меняется
      await this.cardsRepository.update(id, updateCardDto);
    }

    return this.findOne(id);
  }

  // Метод для ответа на карточку (обновление интервала повторения)
  async answerCard(
    id: string,
    isCorrect: boolean,
    userId: number,
  ): Promise<Card> {
    const card = await this.findOne(id);

    // Проверяем доступ к колоде
    if (!card.deck.isPublic && card.deck.owner.id !== userId) {
      throw new ForbiddenException('У вас нет доступа к этой колоде');
    }

    // Обновляем параметры карточки в зависимости от правильности ответа
    if (isCorrect) {
      // Правильный ответ: увеличиваем интервал, сбрасываем счетчик неправильных ответов
      card.correctStreak += 1;
      card.incorrectStreak = 0;
      card.intervalStep += 1;
    } else {
      // Неправильный ответ: уменьшаем интервал, сбрасываем счетчик правильных ответов
      card.correctStreak = 0;
      card.incorrectStreak += 1;
      card.intervalStep = Math.max(0, card.intervalStep - 1);
    }

    // Вычисляем следующую дату повторения на основе интервального алгоритма
    const nextReviewDate = new Date();

    // Алгоритм интервального повторения (упрощенная версия алгоритма SuperMemo)
    // 0 - сразу, 1 - через день, 2 - через 3 дня, 3 - через 7 дней, 4 - через 14 дней, 5 - через 30 дней, 6+ - через 60+ дней
    let daysToAdd = 0;

    switch (card.intervalStep) {
      case 0:
        daysToAdd = 0; // повторить в тот же день
        break;
      case 1:
        daysToAdd = 1; // через день
        break;
      case 2:
        daysToAdd = 3; // через 3 дня
        break;
      case 3:
        daysToAdd = 7; // через неделю
        break;
      case 4:
        daysToAdd = 14; // через 2 недели
        break;
      case 5:
        daysToAdd = 30; // через месяц
        break;
      default:
        daysToAdd = 60 + (card.intervalStep - 6) * 30; // через 2+ месяца
        break;
    }

    nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);
    card.nextReviewDate = nextReviewDate;

    return this.cardsRepository.save(card);
  }

  // Удаление карточки
  async remove(id: string, userId: number): Promise<void> {
    const card = await this.findOne(id);

    // Проверяем, что пользователь является владельцем колоды
    if (card.deck.owner.id !== userId) {
      throw new ForbiddenException('Вы не являетесь владельцем этой колоды');
    }

    const deckId = card.deck.id;

    await this.cardsRepository.softDelete(id);

    // Обновляем счетчик карточек в колоде
    await this.decksService.updateCardsCount(deckId);
  }
}
