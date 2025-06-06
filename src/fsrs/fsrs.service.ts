import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FsrsCard,
  FsrsCardWithContent,
  Rating,
  State,
} from './domain/fsrs-card';
import {
  fsrs,
  type Card as FsrsApiCard,
  createEmptyCard,
  FSRS,
  RatingType,
} from 'ts-fsrs';
import { FsrsCardRepository } from './infrastructure/persistence/fsrs-card.repository';
import { CardRepository } from '../cards/infrastructure/persistence/card.repository';
import { User } from 'src/users/domain/user';
import { Card } from '../cards/domain/card';
import { t } from '../utils/i18n';
import { IPaginationOptions } from '../utils/types/pagination-options';

@Injectable()
export class FsrsService {
  private readonly fsrsInstance: FSRS;

  constructor(
    private readonly fsrsCardRepository: FsrsCardRepository,
    private readonly cardRepository: CardRepository,
  ) {
    // Инициализация с параметрами по умолчанию
    this.fsrsInstance = fsrs();
  }

  /**
   * Инициализирует новую FSRS карточку с параметрами по умолчанию
   */
  async initializeCard(cardId: string): Promise<FsrsCard> {
    // Проверяем, не создана ли уже FSRS карточка
    const existingFsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (existingFsrsCard) {
      return existingFsrsCard;
    }

    // Создаем пустую карточку с помощью ts-fsrs
    const now = new Date();
    const emptyFsrsCard = createEmptyCard();

    // Создаем нашу доменную FsrsCard
    const fsrsCard = new FsrsCard();
    fsrsCard.cardId = cardId;
    fsrsCard.due = emptyFsrsCard.due;
    fsrsCard.stability = emptyFsrsCard.stability;
    fsrsCard.difficulty = emptyFsrsCard.difficulty;
    fsrsCard.elapsed_days = emptyFsrsCard.elapsed_days;
    fsrsCard.scheduled_days = emptyFsrsCard.scheduled_days;
    fsrsCard.reps = emptyFsrsCard.reps;
    fsrsCard.lapses = emptyFsrsCard.lapses;
    fsrsCard.state = emptyFsrsCard.state;
    fsrsCard.last_review = emptyFsrsCard.last_review;
    fsrsCard.suspended = now;
    fsrsCard.deleted = false;

    return this.fsrsCardRepository.create(fsrsCard);
  }

  async findDueCards(userId: User['id']): Promise<FsrsCardWithContent[]> {
    const now = new Date();
    return this.fsrsCardRepository.findDueCards(userId, now);
  }

  async findDueCardsByDeckId(deckId: string): Promise<FsrsCardWithContent[]> {
    const now = new Date();
    return this.fsrsCardRepository.findDueCardsByDeckId(deckId, now);
  }

  async findCardsByState(
    state: State,
    paginationOptions: IPaginationOptions,
    userId?: string,
  ): Promise<FsrsCardWithContent[]> {
    return this.fsrsCardRepository.findByState(
      state,
      paginationOptions,
      userId,
    );
  }

  async getStateStatistics(userId: string): Promise<Record<string, number>> {
    return this.fsrsCardRepository.getStateStatistics(userId);
  }

  async findUpcomingDueCards(
    userId: string,
    days: number = 7,
  ): Promise<FsrsCardWithContent[]> {
    return this.fsrsCardRepository.findUpcomingDueCards(userId, days);
  }

  async gradeCard(
    cardId: string,
    rating: Rating,
    userId: User['id'],
  ): Promise<FsrsCardWithContent> {
    // Получаем Card, если нужно проверить права доступа
    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException(t('fsrs.errors.cardNotFound'));
    }

    // Проверяем права доступа
    if (card.userId !== String(userId)) {
      throw new ForbiddenException(t('fsrs.errors.noPermission'));
    }

    // Применяем оценку
    const fsrsCard = await this.applyRating(cardId, rating);

    return {
      ...fsrsCard,
      card: card,
    };
  }

  /**
   * Пакетная оценка карточек для оптимизации
   */
  async gradeCards(
    grades: Array<{ cardId: string; rating: Rating }>,
    userId: User['id'],
  ): Promise<Array<{ card: Card; fsrsCard: FsrsCard }>> {
    // Получаем все карточки за один запрос
    const cardIds = grades.map((g) => g.cardId);
    const cards = await this.cardRepository.findByIds(cardIds);
    const fsrsCards = await this.fsrsCardRepository.findByCardIds(cardIds);

    // Проверяем права доступа
    for (const card of cards) {
      if (card.userId !== String(userId)) {
        throw new ForbiddenException(t('fsrs.errors.noPermission'));
      }
    }

    // Применяем оценки
    const updates: Array<{ id: string; data: Partial<FsrsCard> }> = [];
    const results: Array<{ card: Card; fsrsCard: FsrsCard }> = [];

    for (const grade of grades) {
      const card = cards.find((c) => c.id === grade.cardId);
      const fsrsCard = fsrsCards.find((fc) => fc.cardId === grade.cardId);

      if (!card || !fsrsCard) continue;

      const updatedFsrsCard = this.calculateNewFsrsState(
        fsrsCard,
        grade.rating,
      );

      updates.push({
        id: fsrsCard.id,
        data: updatedFsrsCard,
      });

      results.push({ card, fsrsCard: updatedFsrsCard });
    }

    // Пакетное обновление в базе данных
    if (updates.length > 0) {
      await this.fsrsCardRepository.batchUpdate(updates);
    }

    return results;
  }

  /**
   * Вычисление нового состояния FSRS карточки без сохранения в БД
   */
  private calculateNewFsrsState(fsrsCard: FsrsCard, rating: Rating): FsrsCard {
    const fsrsApiCard = this.toFsrsApiCard(fsrsCard);
    const now = new Date();

    if (rating !== Rating.Manual) {
      const result = this.fsrsInstance.next(fsrsApiCard, now, rating);

      // Создаем новый объект с обновленными данными
      return {
        ...fsrsCard,
        due: result.card.due,
        stability: result.card.stability,
        difficulty: result.card.difficulty,
        elapsed_days: result.card.elapsed_days,
        scheduled_days: result.card.scheduled_days,
        reps: result.card.reps,
        lapses: result.card.lapses,
        state: result.card.state,
        last_review: now,
      };
    }

    return fsrsCard;
  }

  /**
   * Применяет оценку к FSRS карточке по алгоритму FSRS
   */
  async applyRating(cardId: string, rating: Rating): Promise<FsrsCard> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    const updatedFsrsCard = this.calculateNewFsrsState(fsrsCard, rating);

    // Сохраняем обновленную карточку
    const result = await this.fsrsCardRepository.update(
      fsrsCard.id,
      updatedFsrsCard,
    );
    if (!result) {
      throw new Error('Failed to update FsrsCard');
    }

    return result;
  }

  /**
   * Приостановить карточку до указанной даты
   */
  async suspendCard(
    cardId: string,
    until: Date,
    userId?: string,
  ): Promise<{ card: Card; fsrsCard: FsrsCard }> {
    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException(t('fsrs.errors.cardNotFound'));
    }

    if (userId && card.userId !== userId) {
      throw new ForbiddenException(t('fsrs.errors.noPermission'));
    }

    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    const updatedFsrsCard = await this.fsrsCardRepository.update(fsrsCard.id, {
      suspended: until,
    });

    if (!updatedFsrsCard) {
      throw new Error('Failed to update FsrsCard');
    }

    return { card, fsrsCard: updatedFsrsCard };
  }

  /**
   * Сбросить состояние карточки до начального
   */
  async resetCard(
    cardId: string,
    userId?: string,
  ): Promise<{ card: Card; fsrsCard: FsrsCard }> {
    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException(t('fsrs.errors.cardNotFound'));
    }

    if (userId && card.userId !== userId) {
      throw new ForbiddenException(t('fsrs.errors.noPermission'));
    }

    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Сбрасываем состояние карточки до начального
    const now = new Date();
    const emptyCard = createEmptyCard();

    const resetData = {
      state: emptyCard.state,
      due: emptyCard.due,
      stability: emptyCard.stability,
      difficulty: emptyCard.difficulty,
      elapsed_days: emptyCard.elapsed_days,
      scheduled_days: emptyCard.scheduled_days,
      reps: emptyCard.reps,
      lapses: emptyCard.lapses,
      suspended: now,
      last_review: undefined,
    };

    const updatedFsrsCard = await this.fsrsCardRepository.update(
      fsrsCard.id,
      resetData,
    );
    if (!updatedFsrsCard) {
      throw new Error('Failed to update FsrsCard');
    }

    return { card, fsrsCard: updatedFsrsCard };
  }

  /**
   * Отменить последнюю оценку карточки
   */
  async undoLastGrade(
    cardId: string,
    userId?: string,
  ): Promise<{ card: Card; fsrsCard: FsrsCard }> {
    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException(t('fsrs.errors.cardNotFound'));
    }

    if (userId && card.userId !== userId) {
      throw new ForbiddenException(t('fsrs.errors.noPermission'));
    }

    const fsrsCard = await this.undoLastRating(cardId);

    return { card, fsrsCard };
  }

  /**
   * Возвращает вероятность запоминания карточки на текущий момент
   */
  async getRetentionProbability(cardId: string): Promise<number> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    const fsrsApiCard = this.toFsrsApiCard(fsrsCard);
    const now = new Date();

    return this.fsrsInstance.get_retrievability(fsrsApiCard, now, false);
  }

  /**
   * Предварительный просмотр результатов применения разных оценок
   */
  async previewRatings(cardId: string): Promise<
    Record<
      RatingType,
      {
        due: Date;
        interval: number;
        state: State;
      }
    >
  > {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    const fsrsApiCard = this.toFsrsApiCard(fsrsCard);
    const now = new Date();
    const preview = this.fsrsInstance.repeat(fsrsApiCard, now);

    const result: Record<
      RatingType,
      {
        due: Date;
        interval: number;
        state: State;
      }
    > = {} as any;

    // Пропускаем Rating.Manual, начинаем с Rating.Again (1)
    for (let i = Rating.Again; i <= Rating.Easy; i++) {
      const rating = ['Manual', 'Again', 'Hard', 'Good', 'Easy'][
        i
      ] as RatingType;
      const previewResult = preview[i];

      const due = previewResult.card.due;
      const currentDate = new Date();
      const interval = Math.round(
        (due.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      result[rating] = {
        due: previewResult.card.due,
        interval,
        state: previewResult.card.state,
      };
    }

    return result;
  }

  /**
   * Находит FSRS карточку по ID обычной карточки
   */
  async findByCardId(cardId: string): Promise<FsrsCard | null> {
    return this.fsrsCardRepository.findByCardId(cardId);
  }

  /**
   * Отменяет последнюю оценку карточки
   */
  async undoLastRating(cardId: string): Promise<FsrsCard> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Упрощенная логика отмены
    const undoData: Partial<FsrsCard> = {};

    if (fsrsCard.reps > 0) {
      undoData.reps = Math.max(0, fsrsCard.reps - 1);

      if (undoData.reps === 0) {
        const emptyCard = createEmptyCard();
        Object.assign(undoData, {
          state: emptyCard.state,
          due: emptyCard.due,
          stability: emptyCard.stability,
          difficulty: emptyCard.difficulty,
          elapsed_days: emptyCard.elapsed_days,
          scheduled_days: emptyCard.scheduled_days,
          lapses: emptyCard.lapses,
          last_review: undefined,
        });
      }
    }

    const updatedCard = await this.fsrsCardRepository.update(
      fsrsCard.id,
      undoData,
    );
    if (!updatedCard) {
      throw new Error('Failed to update FsrsCard');
    }

    return updatedCard;
  }

  // Методы для совместимости с контроллером

  async findAllWithPagination({
    paginationOptions,
    deckId,
  }: {
    paginationOptions: { page: number; limit: number };
    deckId?: string;
  }): Promise<FsrsCard[]> {
    return this.fsrsCardRepository.findAllWithPagination({
      paginationOptions,
      deckId,
    });
  }

  async findById(id: string): Promise<FsrsCard | null> {
    return this.fsrsCardRepository.findById(id);
  }

  async update(
    id: string,
    updateData: Partial<FsrsCard>,
  ): Promise<FsrsCard | null> {
    return this.fsrsCardRepository.update(id, updateData);
  }

  async remove(id: string): Promise<void> {
    return this.fsrsCardRepository.remove(id);
  }

  create(): Promise<FsrsCard> {
    throw new Error('Use initializeCard method instead');
  }

  // Вспомогательные методы

  private toFsrsApiCard(fsrsCard: FsrsCard): FsrsApiCard {
    return {
      due: fsrsCard.due,
      stability: fsrsCard.stability,
      difficulty: fsrsCard.difficulty,
      elapsed_days: fsrsCard.elapsed_days,
      scheduled_days: fsrsCard.scheduled_days,
      reps: fsrsCard.reps,
      lapses: fsrsCard.lapses,
      state: fsrsCard.state,
      last_review: fsrsCard.last_review,
    };
  }

  private getRatingEnum(rating: RatingType): Rating {
    switch (rating) {
      case 'Manual':
        return Rating.Manual;
      case 'Again':
        return Rating.Again;
      case 'Hard':
        return Rating.Hard;
      case 'Good':
        return Rating.Good;
      case 'Easy':
        return Rating.Easy;
      default:
        return Rating.Good;
    }
  }
}
