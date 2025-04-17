import { Injectable } from '@nestjs/common';
import { Card, StateType, states } from '../cards/domain/card';
import {
  ReviewLog,
  RatingType,
  ratings,
} from '../review-logs/domain/review-log';
import {
  fsrs,
  type Card as FsrsCard,
  Rating,
  State,
  createEmptyCard,
} from 'ts-fsrs';
import { v4 as uuidv4 } from 'uuid';
import { ReviewLogRepository } from '../review-logs/infrastructure/persistence/review-log.repository';

@Injectable()
export class FsrsService {
  private readonly fsrsInstance;

  constructor(private readonly reviewLogRepository: ReviewLogRepository) {
    // Инициализация с параметрами по умолчанию
    this.fsrsInstance = fsrs();
  }

  /**
   * Инициализирует новую карточку с параметрами FSRS
   */
  initializeCard(card: Card, now: Date): Card {
    // Создаем пустую карточку с помощью ts-fsrs
    const emptyFsrsCard = createEmptyCard(now);

    // Копируем данные из пустой карточки FSRS в нашу доменную карточку
    card.due = emptyFsrsCard.due;
    card.stability = emptyFsrsCard.stability;
    card.difficulty = emptyFsrsCard.difficulty;
    card.elapsed_days = emptyFsrsCard.elapsed_days;
    card.scheduled_days = emptyFsrsCard.scheduled_days;
    card.reps = emptyFsrsCard.reps;
    card.lapses = emptyFsrsCard.lapses;
    card.state = states[emptyFsrsCard.state] as StateType;
    card.last_review = emptyFsrsCard.last_review;
    card.suspended = now;
    card.deleted = false;

    return card;
  }

  /**
   * Преобразует доменную карточку в формат ts-fsrs
   */
  private toFsrsCard(card: Card): FsrsCard {
    return {
      due: card.due,
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsed_days,
      scheduled_days: card.scheduled_days,
      reps: card.reps,
      lapses: card.lapses,
      state: this.getStateEnum(card.state),
      last_review: card.last_review || undefined,
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
   * Применяет оценку к карточке по алгоритму FSRS
   */
  applyRating(card: Card, rating: RatingType): Card {
    // Преобразуем доменную карточку в формат ts-fsrs
    const fsrsCard = this.toFsrsCard(card);

    // Применяем оценку
    const now = new Date();
    const ratingEnum = this.getRatingEnum(rating);

    // Если оценка не Manual, то обновляем карточку с помощью FSRS
    if (ratingEnum !== Rating.Manual) {
      const result = this.fsrsInstance.next(fsrsCard, now, ratingEnum);

      // Копируем обновленные данные из результата FSRS в нашу доменную карточку
      card.due = result.card.due;
      card.stability = result.card.stability;
      card.difficulty = result.card.difficulty;
      card.elapsed_days = result.card.elapsed_days;
      card.scheduled_days = result.card.scheduled_days;
      card.reps = result.card.reps;
      card.lapses = result.card.lapses;
      card.state = states[result.card.state] as StateType;
      card.last_review = now;
    }

    return card;
  }

  /**
   * Создает запись в журнале проверок на основе карточки и оценки
   */
  async createReviewLog(card: Card, rating: RatingType): Promise<ReviewLog> {
    // Считаем разницу между текущим просмотром и предыдущим
    let lastElapsedDays = 0;
    let lastReviewLog: ReviewLog | null = null;

    try {
      lastReviewLog = await this.reviewLogRepository.findLatestByCardId(
        card.id,
      );
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
    reviewLog.cardId = card.id;
    reviewLog.grade = rating;
    reviewLog.state = card.state;
    reviewLog.due = card.due;
    reviewLog.stability = card.stability;
    reviewLog.difficulty = card.difficulty;
    reviewLog.elapsed_days = card.elapsed_days;
    reviewLog.last_elapsed_days = lastElapsedDays;
    reviewLog.scheduled_days = card.scheduled_days;
    reviewLog.review = new Date();
    reviewLog.duration = 0; // Можно добавить учет длительности повторения
    reviewLog.deleted = false;

    return this.reviewLogRepository.create(reviewLog);
  }

  /**
   * Возвращает вероятность запоминания карточки на текущий момент
   */
  getRetentionProbability(card: Card): number {
    // Преобразуем доменную карточку в формат ts-fsrs
    const fsrsCard = this.toFsrsCard(card);

    // Получаем вероятность запоминания
    const now = new Date();
    const retention = this.fsrsInstance.get_retrievability(
      fsrsCard,
      now,
      false,
    ) as number;

    return retention;
  }

  /**
   * Предварительный просмотр результатов применения разных оценок
   */
  previewRatings(card: Card): Record<
    RatingType,
    {
      due: Date;
      interval: number;
      state: StateType;
    }
  > {
    // Преобразуем доменную карточку в формат ts-fsrs
    const fsrsCard = this.toFsrsCard(card);

    // Получаем предварительный просмотр для всех оценок
    const now = new Date();
    const preview = this.fsrsInstance.repeat(fsrsCard, now);

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
}
