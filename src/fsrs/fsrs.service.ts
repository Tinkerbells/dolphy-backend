import { Injectable } from '@nestjs/common';
import { FsrsCard, StateType, states } from './domain/fsrs-card';
import {
  ReviewLog,
  RatingType,
  ratings,
} from '../review-logs/domain/review-log';
import {
  fsrs,
  type Card as FsrsApiCard,
  Rating,
  State,
  createEmptyCard,
  FSRS,
} from 'ts-fsrs';
import { v4 as uuidv4 } from 'uuid';
import { ReviewLogRepository } from '../review-logs/infrastructure/persistence/review-log.repository';
import { FsrsCardRepository } from './infrastructure/persistence/fsrs-card.repository';

@Injectable()
export class FsrsService {
  private readonly fsrsInstance: FSRS;

  constructor(
    private readonly fsrsCardRepository: FsrsCardRepository,
    private readonly reviewLogRepository: ReviewLogRepository,
  ) {
    // Инициализация с параметрами по умолчанию
    this.fsrsInstance = fsrs();
  }

  /**
   * Инициализирует новую FSRS карточку с параметрами по умолчанию
   */
  async initializeCard(cardId: string, now: Date): Promise<FsrsCard> {
    // Создаем пустую карточку с помощью ts-fsrs
    const emptyFsrsCard = createEmptyCard();

    // Создаем нашу доменную FsrsCard
    const fsrsCard = new FsrsCard();
    fsrsCard.id = uuidv4();
    fsrsCard.cardId = cardId;
    fsrsCard.due = emptyFsrsCard.due;
    fsrsCard.stability = emptyFsrsCard.stability;
    fsrsCard.difficulty = emptyFsrsCard.difficulty;
    fsrsCard.elapsed_days = emptyFsrsCard.elapsed_days;
    fsrsCard.scheduled_days = emptyFsrsCard.scheduled_days;
    fsrsCard.reps = emptyFsrsCard.reps;
    fsrsCard.lapses = emptyFsrsCard.lapses;
    fsrsCard.state = states[emptyFsrsCard.state];
    fsrsCard.last_review = emptyFsrsCard.last_review;
    fsrsCard.suspended = now;
    fsrsCard.deleted = false;
    fsrsCard.createdAt = now;

    return this.fsrsCardRepository.create(fsrsCard);
  }

  /**
   * Преобразует доменную FsrsCard в формат ts-fsrs
   */
  private toFsrsApiCard(fsrsCard: FsrsCard): FsrsApiCard {
    return {
      due: fsrsCard.due,
      stability: fsrsCard.stability,
      difficulty: fsrsCard.difficulty,
      elapsed_days: fsrsCard.elapsed_days,
      scheduled_days: fsrsCard.scheduled_days,
      reps: fsrsCard.reps,
      lapses: fsrsCard.lapses,
      state: this.getStateEnum(fsrsCard.state),
      last_review: fsrsCard.last_review,
    };
  }

  /**
   * Преобразует строковое представление состояния в enum ts-fsrs
   */
  private getStateEnum(state: StateType): State {
    switch (state) {
      case 'New':
        return State.New;
      case 'Learning':
        return State.Learning;
      case 'Review':
        return State.Review;
      case 'Relearning':
        return State.Relearning;
      default:
        return State.New;
    }
  }

  /**
   * Преобразует строковое представление рейтинга в enum ts-fsrs
   */
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

  /**
   * Применяет оценку к FSRS карточке по алгоритму FSRS
   */
  async applyRating(cardId: string, rating: RatingType): Promise<FsrsCard> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Преобразуем доменную карточку в формат ts-fsrs
    const fsrsApiCard = this.toFsrsApiCard(fsrsCard);

    // Применяем оценку
    const now = new Date();
    const ratingEnum = this.getRatingEnum(rating);

    // Если оценка не Manual, то обновляем карточку с помощью FSRS
    if (ratingEnum !== Rating.Manual) {
      const result = this.fsrsInstance.next(fsrsApiCard, now, ratingEnum);

      // Копируем обновленные данные из результата FSRS в нашу доменную карточку
      fsrsCard.due = result.card.due;
      fsrsCard.stability = result.card.stability;
      fsrsCard.difficulty = result.card.difficulty;
      fsrsCard.elapsed_days = result.card.elapsed_days;
      fsrsCard.scheduled_days = result.card.scheduled_days;
      fsrsCard.reps = result.card.reps;
      fsrsCard.lapses = result.card.lapses;
      fsrsCard.state = states[result.card.state];
      fsrsCard.last_review = now;
    }

    // Сохраняем обновленную карточку
    const updatedFsrsCard = await this.fsrsCardRepository.update(
      fsrsCard.id,
      fsrsCard,
    );
    if (!updatedFsrsCard) {
      throw new Error('Failed to update FsrsCard');
    }

    return updatedFsrsCard;
  }

  /**
   * Создает запись в журнале проверок на основе карточки и оценки
   */
  async createReviewLog(
    cardId: string,
    rating: RatingType,
  ): Promise<ReviewLog> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Считаем разницу между текущим просмотром и предыдущим
    let lastElapsedDays = 0;
    let lastReviewLog: ReviewLog | null = null;

    try {
      lastReviewLog = await this.reviewLogRepository.findLatestByCardId(cardId);
    } catch (error) {
      console.error('Error fetching last review log', error);
    }

    if (lastReviewLog) {
      // Если есть предыдущий лог, вычисляем дни между просмотрами
      const now = new Date();
      const lastReviewDate = lastReviewLog.review;
      const diffTime = Math.abs(now.getTime() - lastReviewDate.getTime());
      lastElapsedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Создаем новую запись в журнале
    const reviewLog = new ReviewLog();
    reviewLog.id = uuidv4();
    reviewLog.cardId = cardId;
    reviewLog.grade = rating;
    reviewLog.state = fsrsCard.state;
    reviewLog.due = fsrsCard.due;
    reviewLog.stability = fsrsCard.stability;
    reviewLog.difficulty = fsrsCard.difficulty;
    reviewLog.elapsed_days = fsrsCard.elapsed_days;
    reviewLog.last_elapsed_days = lastElapsedDays;
    reviewLog.scheduled_days = fsrsCard.scheduled_days;
    reviewLog.review = new Date();
    reviewLog.duration = 0; // Можно добавить учет длительности повторения
    reviewLog.deleted = false;

    return this.reviewLogRepository.create(reviewLog);
  }

  /**
   * Возвращает вероятность запоминания карточки на текущий момент
   */
  async getRetentionProbability(cardId: string): Promise<number> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Преобразуем доменную карточку в формат ts-fsrs
    const fsrsApiCard = this.toFsrsApiCard(fsrsCard);

    // Получаем вероятность запоминания
    const now = new Date();
    const retention = this.fsrsInstance.get_retrievability(
      fsrsApiCard,
      now,
      false,
    );

    return retention;
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
        state: StateType;
      }
    >
  > {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Преобразуем доменную карточку в формат ts-fsrs
    const fsrsApiCard = this.toFsrsApiCard(fsrsCard);

    // Получаем предварительный просмотр для всех оценок
    const now = new Date();
    const preview = this.fsrsInstance.repeat(fsrsApiCard, now);

    // Преобразуем результаты в удобный формат
    const result: Record<
      RatingType,
      {
        due: Date;
        interval: number;
        state: StateType;
      }
    > = {} as any;

    // Пропускаем Rating.Manual, начинаем с Rating.Again (1)
    for (let i = Rating.Again; i <= Rating.Easy; i++) {
      const rating = ratings[i] as RatingType;
      const previewResult = preview[i]; // i соответствует enum Rating в ts-fsrs

      const due = previewResult.card.due;
      const currentDate = new Date();
      const interval = Math.round(
        (due.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      result[rating] = {
        due: previewResult.card.due,
        interval,
        state: states[previewResult.card.state] as StateType,
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
   * Находит все карточки, готовые к повторению для конкретной колоды
   */
  async findDueCardsByDeckId(deckId: string): Promise<FsrsCard[]> {
    const now = new Date();
    return this.fsrsCardRepository.findDueCardsByDeckId(deckId, now);
  }

  /**
   * Приостанавливает карточку до указанной даты
   */
  async suspendCard(cardId: string, until: Date): Promise<FsrsCard> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    fsrsCard.suspended = until;
    const updatedCard = await this.fsrsCardRepository.update(
      fsrsCard.id,
      fsrsCard,
    );
    if (!updatedCard) {
      throw new Error('Failed to update FsrsCard');
    }

    return updatedCard;
  }

  /**
   * Сбрасывает карточку к начальному состоянию
   */
  async resetCard(cardId: string): Promise<FsrsCard> {
    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Сбрасываем состояние карточки до начального
    const now = new Date();
    const emptyCard = createEmptyCard();

    fsrsCard.state = states[emptyCard.state];
    fsrsCard.due = emptyCard.due;
    fsrsCard.stability = emptyCard.stability;
    fsrsCard.difficulty = emptyCard.difficulty;
    fsrsCard.elapsed_days = emptyCard.elapsed_days;
    fsrsCard.scheduled_days = emptyCard.scheduled_days;
    fsrsCard.reps = emptyCard.reps;
    fsrsCard.lapses = emptyCard.lapses;
    fsrsCard.suspended = now;
    fsrsCard.last_review = undefined;

    const updatedCard = await this.fsrsCardRepository.update(
      fsrsCard.id,
      fsrsCard,
    );
    if (!updatedCard) {
      throw new Error('Failed to update FsrsCard');
    }

    return updatedCard;
  }

  /**
   * Отменяет последнюю оценку карточки
   */
  async undoLastRating(cardId: string): Promise<FsrsCard> {
    // Найти последний лог оценки для этой карточки
    const latestReviewLog =
      await this.reviewLogRepository.findLatestByCardId(cardId);
    if (!latestReviewLog) {
      throw new Error('No review log found');
    }

    // Найдем все логи оценок для карточки в порядке от новых к старым
    const allLogs = await this.reviewLogRepository.findByCardId(cardId);
    if (allLogs.length <= 1) {
      // Если это была первая оценка карточки, возвращаем её к начальному состоянию
      return this.resetCard(cardId);
    }

    // Сортируем логи по времени оценки (от новых к старым)
    allLogs.sort((a, b) => b.review.getTime() - a.review.getTime());

    // Берем второй лог (первый - это текущий, который мы отменяем)
    const previousLog = allLogs[1];

    const fsrsCard = await this.fsrsCardRepository.findByCardId(cardId);
    if (!fsrsCard) {
      throw new Error('FsrsCard not found');
    }

    // Восстанавливаем состояние карточки из предыдущего лога
    fsrsCard.state = previousLog.state as StateType;
    fsrsCard.due = previousLog.due;
    fsrsCard.stability = previousLog.stability;
    fsrsCard.difficulty = previousLog.difficulty;
    fsrsCard.elapsed_days = previousLog.elapsed_days;
    fsrsCard.scheduled_days = previousLog.scheduled_days;
    fsrsCard.reps = fsrsCard.reps > 0 ? fsrsCard.reps - 1 : 0;
    fsrsCard.last_review = previousLog.review;

    const updatedCard = await this.fsrsCardRepository.update(
      fsrsCard.id,
      fsrsCard,
    );
    if (!updatedCard) {
      throw new Error('Failed to update FsrsCard');
    }

    // Пометить лог оценки как удаленный
    await this.reviewLogRepository.update(latestReviewLog.id, {
      deleted: true,
    });

    return updatedCard;
  }

  async findLatestReviewLog(cardId: string): Promise<ReviewLog | null> {
    return this.reviewLogRepository.findLatestByCardId(cardId);
  }

  /**
   * Находит все логи оценок для указанной карточки
   */
  async findReviewLogsByCardId(cardId: string): Promise<ReviewLog[]> {
    return this.reviewLogRepository.findByCardId(cardId);
  }

  /**
   * Помечает лог оценки как удаленный
   */
  async deleteReviewLog(reviewLogId: string): Promise<void> {
    await this.reviewLogRepository.update(reviewLogId, { deleted: true });
  }
}
