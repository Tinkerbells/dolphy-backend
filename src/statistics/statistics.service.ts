import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { StudyStatistic } from './entities/study-statistic.entity';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { DecksService } from '../decks/decks.service';
import { CardsService } from '../cards/cards.service';
import { QueryStatisticDto } from './dto/query-statistic.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';

// Определяем интерфейс для ежедневной статистики и экспортируем его
export interface DailyStatItem {
  date: string;
  total: number;
  correct: number;
  percentage: number;
}

// Определяем интерфейсы для возвращаемых типов
export interface StatisticsSummary {
  totalAnswers: number;
  correctAnswers: number;
  correctPercentage: number;
  studiedDecksCount: number;
  last30Days: DailyStatItem[];
}

export interface DeckStatisticsSummary {
  totalAnswers: number;
  correctAnswers: number;
  correctPercentage: number;
  averageTimeMs: number;
  last30Days: DailyStatItem[];
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(StudyStatistic)
    private readonly statisticsRepository: Repository<StudyStatistic>,
    private readonly decksService: DecksService,
    private readonly cardsService: CardsService,
  ) {}

  // Создание новой записи статистики
  async create(
    createStatisticDto: CreateStatisticDto,
    userId: number,
  ): Promise<StudyStatistic> {
    // Проверяем существование колоды (не используем возвращаемое значение)
    await this.decksService.findOne(createStatisticDto.deckId);

    // Проверяем существование карточки, если указана
    if (createStatisticDto.cardId) {
      // Проверяем, что карточка существует (не используем возвращаемое значение)
      await this.cardsService.findOne(createStatisticDto.cardId);

      // Обновляем данные карточки для алгоритма интервального повторения
      await this.cardsService.answerCard(
        createStatisticDto.cardId,
        createStatisticDto.isCorrect,
        userId,
      );
    }

    // Создаем запись статистики
    const statistic = this.statisticsRepository.create({
      user: { id: userId },
      deck: { id: createStatisticDto.deckId },
      card: createStatisticDto.cardId
        ? { id: createStatisticDto.cardId }
        : undefined, // Используем undefined вместо null
      isCorrect: createStatisticDto.isCorrect,
      timeSpentMs: createStatisticDto.timeSpentMs || 0,
    });

    return this.statisticsRepository.save(statistic);
  }

  // Получение статистики пользователя с фильтрацией
  async findAll(
    query: QueryStatisticDto,
    userId: number,
  ): Promise<InfinityPaginationResponseDto<StudyStatistic>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 50);

    const where: any = { user: { id: userId } };

    if (query.deckId) {
      where.deck = { id: query.deckId };
    }

    if (query.startDate && query.endDate) {
      where.createdAt = Between(query.startDate, query.endDate);
    } else if (query.startDate) {
      where.createdAt = Between(query.startDate, new Date());
    }

    const [data] = await this.statisticsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['deck', 'card'],
    });

    return infinityPagination(data, { page, limit });
  }

  // Получение общей статистики обучения пользователя
  async getSummary(userId: number): Promise<StatisticsSummary> {
    // Общее количество ответов
    const totalAnswers = await this.statisticsRepository.count({
      where: { user: { id: userId } },
    });

    // Количество правильных ответов
    const correctAnswers = await this.statisticsRepository.count({
      where: { user: { id: userId }, isCorrect: true },
    });

    // Процент правильных ответов
    const correctPercentage =
      totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    // Статистика по дням
    const last30Days = await this.getLast30DaysStatistics(userId);

    // Количество изученных колод
    const studiedDecksCount = await this.statisticsRepository
      .createQueryBuilder('stat')
      .select('stat.deck.id')
      .where('stat.user.id = :userId', { userId })
      .distinct(true)
      .getCount();

    return {
      totalAnswers,
      correctAnswers,
      correctPercentage,
      studiedDecksCount,
      last30Days,
    };
  }

  // Получение статистики обучения для конкретной колоды
  async getDeckSummary(
    deckId: string,
    userId: number,
  ): Promise<DeckStatisticsSummary> {
    // Проверяем существование колоды
    await this.decksService.findOne(deckId);

    // Общее количество ответов по колоде
    const totalAnswers = await this.statisticsRepository.count({
      where: { user: { id: userId }, deck: { id: deckId } },
    });

    // Количество правильных ответов по колоде
    const correctAnswers = await this.statisticsRepository.count({
      where: { user: { id: userId }, deck: { id: deckId }, isCorrect: true },
    });

    // Процент правильных ответов
    const correctPercentage =
      totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    // Статистика по дням для этой колоды
    const last30Days = await this.getLast30DaysStatistics(userId, deckId);

    // Средняя скорость ответа
    const avgTimeResult = await this.statisticsRepository
      .createQueryBuilder('stat')
      .select('AVG(stat.timeSpentMs)', 'avgTime')
      .where('stat.user.id = :userId', { userId })
      .andWhere('stat.deck.id = :deckId', { deckId })
      .andWhere('stat.timeSpentMs > 0')
      .getRawOne();

    const averageTimeMs = avgTimeResult ? Math.round(avgTimeResult.avgTime) : 0;

    return {
      totalAnswers,
      correctAnswers,
      correctPercentage,
      averageTimeMs,
      last30Days,
    };
  }

  // Получение статистики за последние 30 дней
  private async getLast30DaysStatistics(
    userId: number,
    deckId?: string,
  ): Promise<DailyStatItem[]> {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    let query = this.statisticsRepository
      .createQueryBuilder('stat')
      .select('DATE(stat.createdAt)', 'date')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        'SUM(CASE WHEN stat.isCorrect = true THEN 1 ELSE 0 END)',
        'correct',
      )
      .where('stat.user.id = :userId', { userId })
      .andWhere('stat.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .groupBy('DATE(stat.createdAt)')
      .orderBy('date', 'ASC');

    if (deckId) {
      query = query.andWhere('stat.deck.id = :deckId', { deckId });
    }

    const results = await query.getRawMany();

    // Форматируем результаты в массив по дням
    const dailyStats: DailyStatItem[] = [];

    // Заполняем все 30 дней, даже если нет данных
    for (let i = 0; i < 30; i++) {
      const day = new Date(thirtyDaysAgo);
      day.setDate(thirtyDaysAgo.getDate() + i);
      const dayString = day.toISOString().split('T')[0]; // YYYY-MM-DD

      const existingDay = results.find((r) => r.date === dayString);

      if (existingDay) {
        dailyStats.push({
          date: dayString,
          total: parseInt(existingDay.total),
          correct: parseInt(existingDay.correct),
          percentage: Math.round(
            (parseInt(existingDay.correct) / parseInt(existingDay.total)) * 100,
          ),
        });
      } else {
        dailyStats.push({
          date: dayString,
          total: 0,
          correct: 0,
          percentage: 0,
        });
      }
    }

    return dailyStats;
  }
}
