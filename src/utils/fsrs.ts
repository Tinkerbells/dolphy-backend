import { Note } from 'src/notes/domain/note';
import { Card } from '../cards/domain/card';
import { RatingType } from '../review-logs/domain/review-log';
import { v4 as uuidv4 } from 'uuid';

/**
 * Создает новую карточку с содержимым
 */
export function newCardWithContent(
  userId: string,
  question: string,
  answer: string,
  metadata?: any,
): { card: Card; note: Note } {
  const cardId = uuidv4();
  const now = new Date();

  // Создаем новую карточку
  const card = new Card();
  card.id = cardId;
  card.userId = userId;
  card.due = now;
  card.stability = 0;
  card.difficulty = 0;
  card.elapsed_days = 0;
  card.scheduled_days = 0;
  card.reps = 0;
  card.lapses = 0;
  card.state = 'New';
  card.suspended = now;
  card.deleted = false;
  card.createdAt = now;

  // Создаем содержимое карточки
  const note = new Note();
  note.id = uuidv4();
  note.cardId = cardId;
  note.question = question;
  note.answer = answer;
  note.extend = metadata || null;
  note.deleted = false;
  note.createdAt = now;

  return { card, note };
}

/**
 * Создает запись в журнале проверок на основе карточки
 */
export function cardToReviewLog(
  card: Card,
  rating: RatingType,
): {
  id: string;
  cardId: string;
  grade: RatingType;
  state: string;
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  last_elapsed_days: number;
  scheduled_days: number;
  review: Date;
  duration: number;
  deleted: boolean;
  createdAt: Date;
} {
  const now = new Date();

  return {
    id: uuidv4(),
    cardId: card.id,
    grade: rating,
    state: card.state,
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    last_elapsed_days: 0, // Требуется вычислить на основе предыдущих логов
    scheduled_days: card.scheduled_days,
    review: now,
    duration: 0,
    deleted: false,
    createdAt: now,
  };
}

/**
 * Применяет оценку к карточке и возвращает обновленную карточку и лог
 */
export function gradeCard(
  card: Card,
  rating: RatingType,
): {
  nextCard: Card;
  reviewLog: ReturnType<typeof cardToReviewLog>;
} {
  // Здесь должен быть код для применения алгоритма FSRS
  // Но для упрощения просто создаем копию карточки и лог
  // Реальная логика будет в FsrsService

  const nextCard = { ...card };

  // Создаем лог
  const reviewLog = cardToReviewLog(card, rating);

  return {
    nextCard,
    reviewLog,
  };
}

/**
 * Расчет интервала в днях между двумя датами
 */
export function calculateIntervalDays(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Форматирование интервала в человекочитаемую строку
 */
export function formatInterval(intervalDays: number): string {
  if (intervalDays < 1) {
    const hours = Math.round(intervalDays * 24);
    return `${hours} ч.`;
  } else if (intervalDays === 1) {
    return '1 день';
  } else if (intervalDays < 31) {
    return `${intervalDays} дн.`;
  } else {
    const months = Math.round(intervalDays / 30);
    return `${months} мес.`;
  }
}

/**
 * Получение статистики карточки
 */
export function getCardStats(
  card: Card,
  reviewLogs: ReturnType<typeof cardToReviewLog>[],
): {
  totalReviews: number;
  successRate: number;
  averageInterval: number;
  daysSinceCreation: number;
} {
  const now = new Date();

  const totalReviews = reviewLogs.length;

  // Подсчет успешных повторений (Good и Easy)
  const successfulReviews = reviewLogs.filter(
    (log) => log.grade === 'Good' || log.grade === 'Easy',
  ).length;

  const successRate =
    totalReviews > 0 ? Math.round((successfulReviews / totalReviews) * 100) : 0;

  // Средний интервал
  const intervals = reviewLogs.map((log) => log.scheduled_days);
  const averageInterval =
    intervals.length > 0
      ? intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length
      : 0;

  // Дни с момента создания
  const daysSinceCreation = calculateIntervalDays(card.createdAt, now);

  return {
    totalReviews,
    successRate,
    averageInterval,
    daysSinceCreation,
  };
}
