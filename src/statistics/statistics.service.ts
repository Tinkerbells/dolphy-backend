import { Injectable } from '@nestjs/common';
import { DeckRepository } from '../decks/infrastructure/persistence/deck.repository';
import { CardRepository } from '../cards/infrastructure/persistence/card.repository';
import { FsrsService } from '../fsrs/fsrs.service';
import { FsrsCardRepository } from '../fsrs/infrastructure/persistence/fsrs-card.repository';
import { DeckStatisticsDto } from './dto/deck-statistics.dto';
import { UserStatisticsDto } from './dto/user-statistics.dto';
import { State } from 'src/fsrs/domain/fsrs-card';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly deckRepository: DeckRepository,
    private readonly cardRepository: CardRepository,
    private readonly fsrsService: FsrsService,
    private readonly fsrsCardRepository: FsrsCardRepository,
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

    // Получаем карточки, которые нужно повторить сегодня через FSRS
    const dueCards = await this.fsrsService.findDueCardsByDeckId(deckId);

    // Получаем FSRS карточки для всех карточек в колоде
    const cardIds = cards.map((card) => card.id);
    const fsrsCards = await this.fsrsCardRepository.findByCardIds(cardIds);

    // Неделю назад для определения недавней активности
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Подсчет карточек по состояниям
    const newCards = fsrsCards.filter(
      (fsrsCard) => fsrsCard.state === State.New,
    ).length;
    const learningCards = fsrsCards.filter(
      (fsrsCard) => fsrsCard.state === State.Learning,
    ).length;
    const reviewCards = fsrsCards.filter(
      (fsrsCard) => fsrsCard.state === State.Review,
    ).length;
    const relearningCards = fsrsCards.filter(
      (fsrsCard) => fsrsCard.state === State.Relearning,
    ).length;

    // Подсчет карточек, изученных за последнюю неделю
    // (карточки, которые имеют last_review в пределах недели)
    const learnedLastWeek = fsrsCards.filter(
      (fsrsCard) =>
        fsrsCard.last_review && new Date(fsrsCard.last_review) >= oneWeekAgo,
    ).length;

    // Расчет успешности на основе соотношения reps к lapses
    const totalReps = fsrsCards.reduce((sum, card) => sum + card.reps, 0);
    const totalLapses = fsrsCards.reduce((sum, card) => sum + card.lapses, 0);
    const successRate =
      totalReps > 0
        ? Math.round(((totalReps - totalLapses) / totalReps) * 100)
        : 0;

    // Среднее время повторения - заглушка, так как нет данных о времени
    const averageReviewTime = 0;

    // Активность по дням на основе last_review
    const activityByDay = {};

    // Инициализируем последние 7 дней
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityByDay[dateStr] = 0;
    }

    // Подсчет повторений по дням на основе last_review
    fsrsCards.forEach((fsrsCard) => {
      if (fsrsCard.last_review) {
        const reviewDate = new Date(fsrsCard.last_review);
        if (reviewDate >= oneWeekAgo) {
          const dateStr = reviewDate.toISOString().split('T')[0];
          if (activityByDay[dateStr] !== undefined) {
            activityByDay[dateStr]++;
          }
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
    const cards = await this.cardRepository.findByUserId(userId);

    // Получаем карточки, которые нужно повторить сегодня через FSRS
    const dueCards = await this.fsrsService.findDueCards(userId);

    // Получаем все FSRS карточки пользователя
    const cardIds = cards.map((card) => card.id);
    const fsrsCards = await this.fsrsCardRepository.findByCardIds(cardIds);

    // Определяем временные периоды
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Недавно изученные карточки (имеют last_review в пределах недели)
    const learnedLastWeek = fsrsCards.filter(
      (fsrsCard) =>
        fsrsCard.last_review && new Date(fsrsCard.last_review) >= oneWeekAgo,
    ).length;

    // Расчет общего процента успешных ответов
    const totalReps = fsrsCards.reduce((sum, card) => sum + card.reps, 0);
    const totalLapses = fsrsCards.reduce((sum, card) => sum + card.lapses, 0);
    const overallSuccessRate =
      totalReps > 0
        ? Math.round(((totalReps - totalLapses) / totalReps) * 100)
        : 0;

    // Состояния карточек
    const cardStates = {
      New: 0,
      Learning: 0,
      Review: 0,
      Relearning: 0,
    };

    fsrsCards.forEach((fsrsCard) => {
      if (fsrsCard.state in cardStates) {
        cardStates[fsrsCard.state]++;
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

    // Подсчет повторений по дням на основе last_review
    fsrsCards.forEach((fsrsCard) => {
      if (fsrsCard.last_review) {
        const reviewDate = new Date(fsrsCard.last_review);
        if (reviewDate >= thirtyDaysAgo) {
          const dateStr = reviewDate.toISOString().split('T')[0];
          if (activityByDay[dateStr] !== undefined) {
            activityByDay[dateStr]++;
          }
        }
      }
    });

    // Наиболее активные колоды
    const deckReviews = {};

    // Инициализируем нулевыми значениями
    decks.forEach((deck) => {
      deckReviews[deck.id] = 0;
    });

    // Подсчет активности по колодам за последние 30 дней
    fsrsCards.forEach((fsrsCard) => {
      if (fsrsCard.last_review) {
        const reviewDate = new Date(fsrsCard.last_review);
        if (reviewDate >= thirtyDaysAgo) {
          const card = cards.find((c) => c.id === fsrsCard.cardId);
          if (card && deckReviews[card.deckId] !== undefined) {
            deckReviews[card.deckId]++;
          }
        }
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
