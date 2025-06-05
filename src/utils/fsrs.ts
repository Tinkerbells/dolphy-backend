import { Card } from '../cards/domain/card';
import { FsrsCard } from '../fsrs/domain/fsrs-card';
import { v4 as uuidv4 } from 'uuid';

/**
 * Создает новую карточку с содержимым
 */
export function newCardWithContent(
  userId: string,
  question: string,
  answer: string,
  deckId: string,
  source: string = 'manual',
  metadata?: any,
): Card {
  const cardId = uuidv4();
  const now = new Date();

  // Создаем новую карточку с контентом
  const card = new Card();
  card.id = cardId;
  card.question = question;
  card.answer = answer;
  card.source = source;
  card.metadata = metadata || null;
  card.deckId = deckId;
  card.userId = userId;
  card.deleted = false;
  card.createdAt = now;
  card.updatedAt = now;

  return card;
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
 * Проверяет, готова ли карточка к повторению
 */
export function isCardDue(fsrsCard: FsrsCard, now: Date = new Date()): boolean {
  return fsrsCard.due <= now && fsrsCard.suspended <= now;
}

/**
 * Получает следующее время показа карточки
 */
export function getNextReviewTime(fsrsCard: FsrsCard): Date {
  return new Date(
    Math.max(fsrsCard.due.getTime(), fsrsCard.suspended.getTime()),
  );
}

/**
 * Форматирует состояние карточки для отображения
 */
export function formatCardState(state: string): string {
  const stateTranslations = {
    New: 'Новая',
    Learning: 'Изучается',
    Review: 'Повторение',
    Relearning: 'Переизучение',
  };

  return stateTranslations[state] || state;
}

/**
 * Определяет цвет для состояния карточки
 */
export function getStateColor(state: string): string {
  const stateColors = {
    New: '#3b82f6', // blue
    Learning: '#f59e0b', // amber
    Review: '#10b981', // emerald
    Relearning: '#ef4444', // red
  };

  return stateColors[state] || '#6b7280'; // gray
}
