import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardRepository } from './infrastructure/persistence/card.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Card, StateType, states } from './domain/card';
import { v4 as uuidv4 } from 'uuid';
import { FsrsService } from '../fsrs/fsrs.service';
import { RatingType } from '../review-logs/domain/review-log';
import { NoteRepository } from 'src/notes/infrastructure/persistence/note.repository';
import { Note } from 'src/notes/domain/note';
import { OperationResultDto } from '../utils/dto/operation-result.dto';
import { t } from 'src/utils/i18n';

@Injectable()
export class CardsService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly noteRepository: NoteRepository,
    private readonly fsrsService: FsrsService,
  ) {}

  async create(
    createCardDto: CreateCardDto,
  ): Promise<{ card: Card; note: Note }> {
    // Создаем карточку с начальными параметрами FSRS
    const newCard = new Card();
    newCard.id = uuidv4();
    newCard.deckId = createCardDto.deckId;

    // Сохраняем карточку и ее содержимое
    const savedCard = await this.cardRepository.create(initializedCard);
    const savedCardNote = await this.noteRepository.create(cardNote);

    // Заполняем поля front и back в карточке
    savedCard.front = savedCardNote.question;
    savedCard.back = savedCardNote.answer;

    return {
      card: savedCard,
      note: savedCardNote,
    };
  }

  async createMany(
    createCardDtos: CreateCardDto[],
    userId: string,
  ): Promise<{ card: Card; note: Note }[]> {
    const results: { card: Card; note: Note }[] = [];

    for (const dto of createCardDtos) {
      const result = await this.create(dto, userId);
      results.push(result);
    }

    return results;
  }

  async findAllWithPagination({
    paginationOptions,
    userId,
    deckId,
  }: {
    paginationOptions: IPaginationOptions;
    userId?: string;
    deckId?: string;
  }): Promise<Card[]> {
    const cards = await this.cardRepository.findAllWithPagination({
      paginationOptions,
      userId,
      deckId,
    });

    // Заполняем поля front и back для всех карточек
    return this.populateCardsContent(cards);
  }

  async findById(id: Card['id']): Promise<Card | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      return null;
    }

    // Заполняем поля front и back
    return this.populateCardContent(card);
  }

  async findWithContent(
    id: Card['id'],
  ): Promise<{ card: Card; note: Note } | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      return null;
    }

    const note = await this.noteRepository.findByCardId(id);
    if (!note) {
      return null;
    }

    // Заполняем поля front и back в карточке
    card.front = note.question;
    card.back = note.answer;

    return { card, note };
  }

  async findByIds(ids: Card['id'][]): Promise<Card[]> {
    const cards = await this.cardRepository.findByIds(ids);
    return this.populateCardsContent(cards);
  }

  async findByDeckId(deckId: string): Promise<Card[]> {
    const cards = await this.cardRepository.findByDeckId(deckId);
    return this.populateCardsContent(cards);
  }

  async findDueCards(userId: string): Promise<Card[]> {
    const now = new Date();
    const cards = await this.cardRepository.findDueCards(userId, now);
    return this.populateCardsContent(cards);
  }

  async findDueCardsByDeckId(deckId: string): Promise<Card[]> {
    const now = new Date();
    const cards = await this.cardRepository.findDueCardsByDeckId(deckId, now);
    return this.populateCardsContent(cards);
  }

  async assignToDeck(cardId: string, deckId: string): Promise<Card | null> {
    const card = await this.cardRepository.assignToDeck(cardId, deckId);
    if (!card) {
      return null;
    }
    return this.populateCardContent(card);
  }

  async update(
    id: Card['id'],
    updateCardDto: UpdateCardDto,
  ): Promise<{ card: Card; note: Note } | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      return null;
    }

    const cardContent = await this.noteRepository.findByCardId(id);
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
      cardContent.extend = updateCardDto.metadata;
    }

    // Если указана колода, обновляем привязку
    if (updateCardDto.deckId !== undefined) {
      card.deckId = updateCardDto.deckId;
      await this.cardRepository.update(id, { deckId: updateCardDto.deckId });
    }

    const updatedNote = await this.noteRepository.update(
      cardContent.id,
      cardContent,
    );

    if (!updatedNote) {
      return null;
    }

    // Заполняем поля front и back в карточке
    card.front = updatedNote.question;
    card.back = updatedNote.answer;

    return {
      card,
      note: updatedNote,
    };
  }

  async grade(id: Card['id'], rating: RatingType): Promise<{ card: Card }> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    // Применяем оценку с помощью FSRS
    const updatedCard = this.fsrsService.applyRating(card, rating);

    // Обновляем карточку
    const savedCard = await this.cardRepository.update(id, updatedCard);
    if (!savedCard) {
      throw new Error(t('cards.errors.failedToUpdate'));
    }

    // Создаем запись о проверке
    await this.fsrsService.createReviewLog(updatedCard, rating);

    // Заполняем поля front и back
    const populatedCard = await this.populateCardContent(savedCard);

    return {
      card: populatedCard,
    };
  }

  async suspend(id: Card['id'], until: Date): Promise<Card | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    card.suspended = until;

    const updatedCard = await this.cardRepository.update(id, card);
    if (!updatedCard) {
      throw new Error(t('cards.errors.failedToUpdate'));
    }

    return this.populateCardContent(updatedCard);
  }

  async reset(id: Card['id']): Promise<Card | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
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

    const updatedCard = await this.cardRepository.update(id, card);
    if (!updatedCard) {
      throw new Error(t('cards.errors.failedToUpdate'));
    }

    return this.populateCardContent(updatedCard);
  }

  async undoGrade(id: Card['id'], userId: string): Promise<{ card: Card }> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    // Проверяем, что пользователь является владельцем карточки
    if (card.userId != userId) {
      throw new ForbiddenException(t('cards.errors.noPermission'));
    }

    // Найти последний лог оценки для этой карточки
    const latestReviewLog = await this.fsrsService.findLatestReviewLog(id);
    if (!latestReviewLog) {
      throw new NotFoundException(t('review-logs.notFound'));
    }

    // Найдем все логи оценок для карточки в порядке от новых к старым
    const allLogs = await this.fsrsService.findReviewLogsByCardId(id);
    if (allLogs.length <= 1) {
      // Если это была первая оценка карточки, возвращаем её к начальному состоянию
      const initializedCard = this.fsrsService.initializeCard(
        { ...card },
        new Date(),
      );
      const savedCard = await this.cardRepository.update(id, initializedCard);
      if (!savedCard) {
        throw new InternalServerErrorException(
          t('cards.errors.failedToUpdate'),
        );
      }

      // Пометить лог оценки как удаленный
      await this.fsrsService.deleteReviewLog(latestReviewLog.id);

      const populatedCard = await this.populateCardContent(savedCard);

      return {
        card: populatedCard,
      };
    }

    // Сортируем логи по времени оценки (от новых к старым)
    allLogs.sort((a, b) => b.review.getTime() - a.review.getTime());

    // Берем второй лог (первый - это текущий, который мы отменяем)
    const previousLog = allLogs[1];

    // Восстанавливаем состояние карточки из предыдущего лога
    const updatedCard = { ...card };
    updatedCard.state = previousLog.state as StateType;
    updatedCard.due = previousLog.due;
    updatedCard.stability = previousLog.stability;
    updatedCard.difficulty = previousLog.difficulty;
    updatedCard.elapsed_days = previousLog.elapsed_days;
    updatedCard.scheduled_days = previousLog.scheduled_days;
    updatedCard.reps = card.reps > 0 ? card.reps - 1 : 0;
    updatedCard.last_review = previousLog.review;

    const savedCard = await this.cardRepository.update(id, updatedCard);
    if (!savedCard) {
      throw new InternalServerErrorException(t('cards.errors.failedToUpdate'));
    }

    // Пометить лог оценки как удаленный
    await this.fsrsService.deleteReviewLog(latestReviewLog.id);

    const populatedCard = await this.populateCardContent(savedCard);

    return {
      card: populatedCard,
    };
  }

  async softDelete(id: Card['id']): Promise<OperationResultDto> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    await this.cardRepository.update(id, { deleted: true });

    // Также отмечаем содержимое карточки как удаленное
    const cardContent = await this.noteRepository.findByCardId(id);
    if (cardContent) {
      await this.noteRepository.update(cardContent.id, {
        deleted: true,
      });
    }

    return {
      success: true,
      message: t('cards.deleted'),
    };
  }

  async restore(id: Card['id']): Promise<OperationResultDto> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    await this.cardRepository.update(id, { deleted: false });

    // Также восстанавливаем содержимое карточки
    const cardContent = await this.noteRepository.findByCardId(id);
    if (cardContent) {
      await this.noteRepository.update(cardContent.id, {
        deleted: false,
      });
    }

    return {
      success: true,
      message: t('cards.restored'),
    };
  }

  remove(id: Card['id']): Promise<void> {
    return this.cardRepository.remove(id);
  }
}
