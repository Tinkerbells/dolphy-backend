import { Injectable } from '@nestjs/common';
import { DeckRepository } from '../decks/infrastructure/persistence/deck.repository';
import { CardRepository } from '../cards/infrastructure/persistence/card.repository';
import { ReviewLogRepository } from '../review-logs/infrastructure/persistence/review-log.repository';
import { DeckStatisticsDto } from './dto/deck-statistics.dto';
import { UserStatisticsDto } from './dto/user-statistics.dto';
import { ReviewLog } from 'src/review-logs/domain/review-log';
import { Card } from 'src/cards/domain/card';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly deckRepository: DeckRepository,
    private readonly cardRepository: CardRepository,
    private readonly reviewLogRepository: ReviewLogRepository,
  ) {}

  /**
   * Получение статистики для конкретной колоды
   */
  async getDeckStatistics(deckId: string): Promise<DeckStatisticsDto> {
    // Получаем все карточки в колоде
    const cards = await this.cardRepository.findByDeckId(deckId);

    if (cards.length === 0) {
      return this.getEmptyDeckStatistics();
    }

    // Получаем карточки, которые нужно повторить сегодня
    const now = new Date();
    const dueCards = await this.cardRepository.findDueCardsByDeckId(
      deckId,
      now,
    );

    // Получаем логи повторений для всех карточек в колоде
    const cardIds = cards.map((card) => card.id);
    const reviewLogs: ReviewLog[] = [];

    for (const cardId of cardIds) {
      const logs = await this.reviewLogRepository.findByCardId(cardId);
      reviewLogs.push(...logs);
    }

    // Неделю назад для определения недавней активности
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Подсчет карточек по состояниям
    const newCards = cards.filter((card) => card.state === 'New').length;
    const learningCards = cards.filter(
      (card) => card.state === 'Learning',
    ).length;
    const reviewCards = cards.filter((card) => card.state === 'Review').length;
    const relearningCards = cards.filter(
      (card) => card.state === 'Relearning',
    ).length;

    // Подсчет недавно изученных карточек
    const recentReviewLogs = reviewLogs.filter(
      (log) => new Date(log.review) >= oneWeekAgo,
    );

    const uniqueCardIds = new Set();
    recentReviewLogs.forEach((log) => uniqueCardIds.add(log.cardId));
    const learnedLastWeek = uniqueCardIds.size;

    // Расчет процента успешных ответов
    const successfulReviews = reviewLogs.filter(
      (log) => log.grade === 'Good' || log.grade === 'Easy',
    ).length;

    const successRate =
      reviewLogs.length > 0 ? (successfulReviews / reviewLogs.length) * 100 : 0;

    // Расчет среднего времени повторения
    const totalDuration = reviewLogs.reduce(
      (sum, log) => sum + log.duration,
      0,
    );
    const averageReviewTime =
      reviewLogs.length > 0
        ? totalDuration / reviewLogs.length / 1000 // Конвертируем в секунды
        : 0;

    // Активность по дням
    const activityByDay = {};

    // Инициализируем последние 7 дней
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityByDay[dateStr] = 0;
    }

    // Подсчет повторений по дням
    reviewLogs.forEach((log) => {
      const reviewDate = new Date(log.review);
      if (reviewDate >= oneWeekAgo) {
        const dateStr = reviewDate.toISOString().split('T')[0];
        if (activityByDay[dateStr] !== undefined) {
          activityByDay[dateStr]++;
        }
      }
    });

    return {
      totalCards: cards.length,
      dueToday: dueCards.length,
      learnedLastWeek,
      successRate,
      newCards,
      learningCards,
      reviewCards,
      relearningCards,
      averageReviewTime,
      activityByDay,
    };
  }

  /**
   * Получение пустой статистики для новых колод без карточек
   */
  private getEmptyDeckStatistics(): DeckStatisticsDto {
    const activityByDay = {};

    // Инициализируем последние 7 дней нулевыми значениями
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityByDay[dateStr] = 0;
    }

    return {
      totalCards: 0,
      dueToday: 0,
      learnedLastWeek: 0,
      successRate: 0,
      newCards: 0,
      learningCards: 0,
      reviewCards: 0,
      relearningCards: 0,
      averageReviewTime: 0,
      activityByDay,
    };
  }

  /**
   * Получение статистики для всех колод пользователя
   */
  async getUserStatistics(userId: string): Promise<UserStatisticsDto> {
    // Получаем все колоды пользователя
    const decks = await this.deckRepository.findByUserId(userId);

    if (decks.length === 0) {
      return this.getEmptyUserStatistics();
    }

    // Получаем все карточки пользователя
    const cards: Card[] = [];
    for (const deck of decks) {
      const deckCards = await this.cardRepository.findByDeckId(deck.id);
      cards.push(...deckCards);
    }

    // Получаем карточки, которые нужно повторить сегодня
    const now = new Date();
    const dueCards = await this.cardRepository.findDueCards(userId, now);

    // Получаем все логи повторений
    const reviewLogs: ReviewLog[] = [];
    const cardIds = cards.map((card) => card.id);

    for (const cardId of cardIds) {
      const logs = await this.reviewLogRepository.findByCardId(cardId);
      reviewLogs.push(...logs);
    }

    // Определяем временные периоды
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Недавно изученные карточки
    const recentReviewLogs = reviewLogs.filter(
      (log) => new Date(log.review) >= oneWeekAgo,
    );

    const uniqueCardIds = new Set();
    recentReviewLogs.forEach((log) => uniqueCardIds.add(log.cardId));
    const learnedLastWeek = uniqueCardIds.size;

    // Расчет процента успешных ответов
    const successfulReviews = reviewLogs.filter(
      (log) => log.grade === 'Good' || log.grade === 'Easy',
    ).length;

    const overallSuccessRate =
      reviewLogs.length > 0 ? (successfulReviews / reviewLogs.length) * 100 : 0;

    // Состояния карточек
    const cardStates = {
      New: 0,
      Learning: 0,
      Review: 0,
      Relearning: 0,
    };

    cards.forEach((card) => {
      if (card.state in cardStates) {
        cardStates[card.state]++;
      }
    });

    // Активность по дням
    const activityByDay = {};

    // Инициализируем последние 30 дней
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityByDay[dateStr] = 0;
    }

    // Подсчет повторений по дням
    reviewLogs.forEach((log) => {
      const reviewDate = new Date(log.review);
      if (reviewDate >= thirtyDaysAgo) {
        const dateStr = reviewDate.toISOString().split('T')[0];
        if (activityByDay[dateStr] !== undefined) {
          activityByDay[dateStr]++;
        }
      }
    });

    // Наиболее активные колоды
    const deckReviews = {};

    // Инициализируем нулевыми значениями
    decks.forEach((deck) => {
      deckReviews[deck.id] = 0;
    });

    // Подсчет повторений по колодам за последние 30 дней
    const last30DaysLogs = reviewLogs.filter(
      (log) => new Date(log.review) >= thirtyDaysAgo,
    );

    last30DaysLogs.forEach((log) => {
      const card = cards.find((c) => c.id === log.cardId);
      if (card && deckReviews[card.deckId] !== undefined) {
        deckReviews[card.deckId]++;
      }
    });

    // Создаем отсортированный массив наиболее активных колод
    const mostActiveDecks = decks
      .map((deck) => ({
        id: deck.id,
        name: deck.name,
        reviews: deckReviews[deck.id],
      }))
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 5); // Топ-5

    return {
      totalCards: cards.length,
      totalDecks: decks.length,
      dueToday: dueCards.length,
      learnedLastWeek,
      overallSuccessRate,
      cardStates,
      activityByDay,
      mostActiveDecks,
    };
  }

  /**
   * Получение пустой статистики для новых пользователей без колод
   */
  private getEmptyUserStatistics(): UserStatisticsDto {
    const activityByDay = {};

    // Инициализируем последние 30 дней нулевыми значениями
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityByDay[dateStr] = 0;
    }

    return {
      totalCards: 0,
      totalDecks: 0,
      dueToday: 0,
      learnedLastWeek: 0,
      overallSuccessRate: 0,
      cardStates: {
        New: 0,
        Learning: 0,
        Review: 0,
        Relearning: 0,
      },
      activityByDay,
      mostActiveDecks: [],
    };
  }
}
