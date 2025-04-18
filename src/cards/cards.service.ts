import { Injectable } from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardRepository } from './infrastructure/persistence/card.repository';
import { CardContentRepository } from './infrastructure/persistence/card-content.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Card, StateType, states } from './domain/card';
import { CardContent } from './domain/card-content';
import { v4 as uuidv4 } from 'uuid';
import { FsrsService } from '../fsrs/fsrs.service';
import { RatingType } from '../review-logs/domain/review-log';

@Injectable()
export class CardsService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly cardContentRepository: CardContentRepository,
    private readonly fsrsService: FsrsService,
  ) {}

  async create(
    createCardDto: CreateCardDto,
    userId: string,
  ): Promise<{ card: Card; cardContent: CardContent }> {
    // Создаем карточку с начальными параметрами FSRS
    const newCard = new Card();
    newCard.id = uuidv4();
    newCard.userId = userId;

    // Если указана колода, присваиваем карточку к ней
    if (createCardDto.deckId) {
      newCard.deckId = createCardDto.deckId;
    }

    // Инициализируем карточку с помощью FSRS
    const now = new Date();
    const initializedCard = this.fsrsService.initializeCard(newCard, now);

    // Создаем содержимое карточки
    const newCardContent = new CardContent();
    newCardContent.id = uuidv4();
    newCardContent.cardId = initializedCard.id;
    newCardContent.question = createCardDto.question;
    newCardContent.answer = createCardDto.answer;
    newCardContent.deleted = false;

    // Если есть метаданные, добавляем их
    if (createCardDto.metadata) {
      newCardContent.source = createCardDto.metadata.source;
      newCardContent.sourceId = createCardDto.metadata.sourceId;
      newCardContent.extend = createCardDto.metadata;
    } else {
      newCardContent.source = 'manual';
    }

    // Сохраняем карточку и ее содержимое
    const savedCard = await this.cardRepository.create(initializedCard);
    const savedCardContent =
      await this.cardContentRepository.create(newCardContent);

    return {
      card: savedCard,
      cardContent: savedCardContent,
    };
  }

  async createMany(
    createCardDtos: CreateCardDto[],
    userId: string,
  ): Promise<{ card: Card; cardContent: CardContent }[]> {
    const results: { card: Card; cardContent: CardContent }[] = [];

    for (const dto of createCardDtos) {
      const result = await this.create(dto, userId);
      results.push(result);
    }

    return results;
  }

  findAllWithPagination({
    paginationOptions,
    userId,
    deckId,
  }: {
    paginationOptions: IPaginationOptions;
    userId?: string;
    deckId?: string;
  }): Promise<Card[]> {
    return this.cardRepository.findAllWithPagination({
      paginationOptions,
      userId,
      deckId,
    });
  }

  findById(id: Card['id']): Promise<Card | null> {
    return this.cardRepository.findById(id);
  }

  async findWithContent(
    id: Card['id'],
  ): Promise<{ card: Card; content: CardContent } | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      return null;
    }

    const content = await this.cardContentRepository.findByCardId(id);
    if (!content) {
      return null;
    }

    return { card, content };
  }

  findByIds(ids: Card['id'][]): Promise<Card[]> {
    return this.cardRepository.findByIds(ids);
  }

  findByDeckId(deckId: string): Promise<Card[]> {
    return this.cardRepository.findByDeckId(deckId);
  }

  async findDueCards(userId: string): Promise<Card[]> {
    const now = new Date();
    return this.cardRepository.findDueCards(userId, now);
  }

  async findDueCardsByDeckId(deckId: string): Promise<Card[]> {
    const now = new Date();
    return this.cardRepository.findDueCardsByDeckId(deckId, now);
  }

  async assignToDeck(cardId: string, deckId: string): Promise<Card | null> {
    return this.cardRepository.assignToDeck(cardId, deckId);
  }

  // async removeFromDeck(cardId: string): Promise<Card | null> {
  //   return this.cardRepository.removeFromDeck(cardId);
  // }

  async update(
    id: Card['id'],
    updateCardDto: UpdateCardDto,
  ): Promise<{ card: Card; cardContent: CardContent } | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      return null;
    }

    const cardContent = await this.cardContentRepository.findByCardId(id);
    if (!cardContent) {
      return null;
    }

    // Обновляем содержимое карточки
    if (updateCardDto.question !== undefined) {
      cardContent.question = updateCardDto.question;
    }

    if (updateCardDto.answer !== undefined) {
      cardContent.answer = updateCardDto.answer;
    }

    // Если есть метаданные, обновляем их
    if (updateCardDto.metadata) {
      cardContent.source = updateCardDto.metadata.source;
      cardContent.sourceId = updateCardDto.metadata.sourceId;
      cardContent.extend = updateCardDto.metadata;
    }

    // Если указана колода, обновляем привязку
    if (updateCardDto.deckId !== undefined) {
      card.deckId = updateCardDto.deckId;
      await this.cardRepository.update(id, { deckId: updateCardDto.deckId });
    }

    const updatedContent = await this.cardContentRepository.update(
      cardContent.id,
      cardContent,
    );

    if (!updatedContent) {
      return null;
    }

    return {
      card,
      cardContent: updatedContent,
    };
  }

  async grade(id: Card['id'], rating: RatingType): Promise<{ card: Card }> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new Error('Card not found');
    }

    // Применяем оценку с помощью FSRS
    const updatedCard = this.fsrsService.applyRating(card, rating);

    // Обновляем карточку
    const savedCard = await this.cardRepository.update(id, updatedCard);
    if (!savedCard) {
      throw new Error('Failed to update card');
    }

    // Создаем запись о проверке
    await this.fsrsService.createReviewLog(updatedCard, rating);

    return {
      card: savedCard,
    };
  }

  async suspend(id: Card['id'], until: Date): Promise<Card | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      return null;
    }

    card.suspended = until;
    return this.cardRepository.update(id, card);
  }

  async reset(id: Card['id']): Promise<Card | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      return null;
    }

    // Сбрасываем состояние карточки до начального
    card.state = states[0] as StateType;
    card.due = new Date();
    card.stability = 0;
    card.difficulty = 0;
    card.elapsed_days = 0;
    card.scheduled_days = 0;
    card.reps = 0;
    card.lapses = 0;
    card.suspended = new Date();

    return this.cardRepository.update(id, card);
  }

  async softDelete(id: Card['id']): Promise<void> {
    await this.cardRepository.update(id, { deleted: true });

    // Также отмечаем содержимое карточки как удаленное
    const cardContent = await this.cardContentRepository.findByCardId(id);
    if (cardContent) {
      await this.cardContentRepository.update(cardContent.id, {
        deleted: true,
      });
    }
  }

  async restore(id: Card['id']): Promise<void> {
    await this.cardRepository.update(id, { deleted: false });

    // Также восстанавливаем содержимое карточки
    const cardContent = await this.cardContentRepository.findByCardId(id);
    if (cardContent) {
      await this.cardContentRepository.update(cardContent.id, {
        deleted: false,
      });
    }
  }

  remove(id: Card['id']): Promise<void> {
    return this.cardRepository.remove(id);
  }
}
