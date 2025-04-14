import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, In, Repository } from 'typeorm';
import { StatisticEntity } from '../entities/statistic.entity';
import {
  StatisticRepository,
  StatisticQueryParams,
  AnalyticsQueryParams,
} from '../../statistic.repository';
import { StatisticMapper } from '../mappers/statistic.mapper';
import { Statistic } from '../../../../domain/statistic';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { AnalyticsType, TimeInterval } from '../../../../dto/get-analytics.dto';

/**
 * Реализация репозитория статистики для SQL базы данных (адаптер)
 */
@Injectable()
export class StatisticRelationalRepository implements StatisticRepository {
  /**
   * Конструктор
   * @param statisticRepository Репозиторий TypeORM
   */
  constructor(
    @InjectRepository(StatisticEntity)
    private readonly statisticRepository: Repository<StatisticEntity>,
  ) {}

  /**
   * Создать новую запись статистики
   * @param data Данные для создания
   */
  async create(
    data: Omit<Statistic, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Statistic> {
    const entity = this.statisticRepository.create(
      StatisticMapper.toPersistence(data as Statistic),
    );
    const savedEntity = await this.statisticRepository.save(entity);
    return StatisticMapper.toDomain(savedEntity);
  }

  /**
   * Найти запись статистики по ID
   * @param id ID записи
   * @param uid ID пользователя
   */
  async findById(
    id: Statistic['id'],
    uid: number,
  ): Promise<NullableType<Statistic>> {
    const entity = await this.statisticRepository.findOne({
      where: { id, uid },
    });

    return entity ? StatisticMapper.toDomain(entity) : null;
  }

  /**
   * Найти все записи статистики с пагинацией и фильтрацией
   * @param params Параметры запроса
   */
  async findAll(
    params: StatisticQueryParams,
  ): Promise<{ data: Statistic[]; total: number }> {
    const {
      uid,
      type,
      did,
      dids,
      cid,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = params;

    const where: FindOptionsWhere<StatisticEntity> = { uid };

    if (type) {
      where.type = type;
    }

    if (did) {
      where.did = did;
    } else if (dids && dids.length > 0) {
      where.did = In(dids);
    }

    if (cid) {
      where.cid = cid;
    }

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = Between(startDate, new Date());
    } else if (endDate) {
      where.createdAt = Between(new Date(0), endDate);
    }

    const [entities, total] = await this.statisticRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: entities.map((entity) => StatisticMapper.toDomain(entity)),
      total,
    };
  }

  /**
   * Обновить запись статистики
   * @param id ID записи
   * @param data Данные для обновления
   * @param uid ID пользователя
   */
  async update(
    id: Statistic['id'],
    data: DeepPartial<Statistic>,
    uid: number,
  ): Promise<NullableType<Statistic>> {
    // Проверяем существование записи
    const existingEntity = await this.statisticRepository.findOne({
      where: { id, uid },
    });

    if (!existingEntity) {
      return null;
    }

    // Обновляем запись
    await this.statisticRepository.update({ id, uid }, data);

    // Возвращаем обновленную запись
    return this.findById(id, uid);
  }

  /**
   * Удалить запись статистики
   * @param id ID записи
   * @param uid ID пользователя
   */
  async remove(id: Statistic['id'], uid: number): Promise<boolean> {
    const result = await this.statisticRepository.delete({ id, uid });

    if (!result) {
      throw new NotFoundException(`Statistic with ${id} not found`);
    }
    return true;
  }

  /**
   * Получить агрегированные данные за день
   * @param uid ID пользователя
   * @param date Дата
   * @param did ID колоды (опционально)
   */
  async getDailyStatistics(
    uid: number,
    date: Date,
    did?: number,
  ): Promise<Record<string, any>> {
    // Устанавливаем начало и конец дня
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Базовые условия запроса
    const where: FindOptionsWhere<StatisticEntity> = {
      uid,
      createdAt: Between(startOfDay, endOfDay),
    };

    if (did) {
      where.did = did;
    }

    // Получаем все записи за день
    const dailyStatistics = await this.statisticRepository.find({
      where,
    });

    // Агрегируем статистику
    const result: Record<string, any> = {
      date: startOfDay.toISOString().split('T')[0],
      totalReviews: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTimeSpentMs: 0,
      newCards: 0,
      learningCards: 0,
      reviewCards: 0,
    };

    for (const stat of dailyStatistics) {
      // Анализируем и агрегируем данные в зависимости от типа
      switch (stat.type) {
        case 'card_review':
          result.totalReviews++;
          if (stat.data.isCorrect) {
            result.correctAnswers++;
          } else {
            result.incorrectAnswers++;
          }
          result.totalTimeSpentMs += stat.data.timeSpentMs || 0;

          // Учитываем тип карточки
          if (stat.data.cardState) {
            const stateMapping = {
              0: 'newCards',
              1: 'learningCards',
              2: 'reviewCards',
              3: 'learningCards', // relearning как learning
            };

            const key = stateMapping[stat.data.cardState];
            if (key) {
              result[key]++;
            }
          }
          break;

        case 'study_session':
          // Объединяем данные о сессиях
          result.totalSessions = (result.totalSessions || 0) + 1;
          result.totalCardsInSessions =
            (result.totalCardsInSessions || 0) + (stat.data.totalCards || 0);
          result.completedCardsInSessions =
            (result.completedCardsInSessions || 0) +
            (stat.data.cardsCompleted || 0);
          break;
      }
    }

    // Добавляем производные метрики
    if (result.totalReviews > 0) {
      result.accuracyRate = (result.correctAnswers / result.totalReviews) * 100;
      result.averageTimePerCardMs =
        result.totalTimeSpentMs / result.totalReviews;
    }

    return result;
  }

  /**
   * Получить аналитические данные
   * @param params Параметры запроса
   */
  async getAnalytics(params: AnalyticsQueryParams): Promise<any[]> {
    const {
      uid,
      type,
      did,
      dids,
      startDate,
      endDate,
      interval = TimeInterval.DAY,
      limit,
    } = params;

    // В зависимости от типа аналитики вызываем соответствующий метод
    switch (type) {
      case AnalyticsType.DAILY_STATS:
        return this.getDailyStatsAnalytics(
          uid,
          startDate,
          endDate,
          interval,
          did,
          dids,
          limit,
        );
      case AnalyticsType.RETENTION_CURVE:
        return this.getRetentionCurveAnalytics(
          uid,
          startDate,
          endDate,
          did,
          dids,
        );
      case AnalyticsType.LEARNING_CURVE:
        return this.getLearningCurveAnalytics(
          uid,
          startDate,
          endDate,
          did,
          dids,
        );
      case AnalyticsType.CARD_DIFFICULTY:
        return this.getCardDifficultyAnalytics(
          uid,
          startDate,
          endDate,
          did,
          dids,
          limit,
        );
      case AnalyticsType.REVIEW_HEATMAP:
        return this.getReviewHeatmapAnalytics(
          uid,
          startDate,
          endDate,
          did,
          dids,
        );
      case AnalyticsType.REVIEW_TIME:
        return this.getReviewTimeAnalytics(
          uid,
          startDate,
          endDate,
          interval,
          did,
          dids,
        );
      default:
        throw new Error(`Неподдерживаемый тип аналитики: ${type}`);
    }
  }

  /**
   * Получить аналитику по ежедневной статистике
   */
  private async getDailyStatsAnalytics(
    uid: number,
    startDate?: Date,
    endDate?: Date,
    interval: TimeInterval = TimeInterval.DAY,
    did?: number,
    dids?: number[],
    limit?: number,
  ): Promise<any[]> {
    // Формируем SQL запрос для получения агрегированных данных по дням
    const query = this.statisticRepository
      .createQueryBuilder('s')
      .select(`DATE_TRUNC('${interval}', s."createdAt")`, 'date')
      .addSelect('COUNT(*)', 'totalReviews')
      .addSelect(
        `SUM(CASE WHEN s.data->>'isCorrect' = 'true' THEN 1 ELSE 0 END)`,
        'correctAnswers',
      )
      .addSelect(
        `COALESCE(AVG((s.data->>'timeSpentMs')::numeric), 0)`,
        'avgTimeSpentMs',
      )
      .where('s.uid = :uid', { uid })
      .andWhere('s.type = :type', { type: 'card_review' });

    // Добавляем фильтры по датам
    if (startDate && endDate) {
      query.andWhere('s."createdAt" BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('s."createdAt" >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('s."createdAt" <= :endDate', { endDate });
    }

    // Добавляем фильтры по колодам
    if (did) {
      query.andWhere('s.did = :did', { did });
    } else if (dids && dids.length > 0) {
      query.andWhere('s.did IN (:...dids)', { dids });
    }

    // Группировка и сортировка
    query.groupBy('date').orderBy('date', 'ASC');

    // Ограничение количества результатов
    if (limit) {
      query.limit(limit);
    }

    // Выполняем запрос
    const rawResults = await query.getRawMany();

    // Преобразуем результаты
    return rawResults.map((row) => ({
      date: row.date,
      totalReviews: parseInt(row.totalReviews),
      correctAnswers: parseInt(row.correctAnswers),
      incorrectAnswers:
        parseInt(row.totalReviews) - parseInt(row.correctAnswers),
      accuracyRate:
        parseInt(row.totalReviews) > 0
          ? (parseInt(row.correctAnswers) / parseInt(row.totalReviews)) * 100
          : 0,
      avgTimeSpentMs: parseFloat(row.avgTimeSpentMs),
    }));
  }

  /**
   * Получить аналитику по кривой запоминания
   */
  private async getRetentionCurveAnalytics(
    uid: number,
    startDate?: Date,
    endDate?: Date,
    did?: number,
    dids?: number[],
  ): Promise<any[]> {
    // Используем SQL для расчета кривой запоминания
    const query = this.statisticRepository
      .createQueryBuilder('s')
      .select(
        `EXTRACT(DAY FROM s."createdAt" - FIRST_VALUE(s."createdAt") OVER (PARTITION BY s.cid ORDER BY s."createdAt"))::integer`,
        'daysSinceFirstReview',
      )
      .addSelect(`COUNT(*)`, 'totalReviews')
      .addSelect(
        `SUM(CASE WHEN s.data->>'isCorrect' = 'true' THEN 1 ELSE 0 END)`,
        'correctAnswers',
      )
      .where('s.uid = :uid', { uid })
      .andWhere('s.type = :type', { type: 'card_review' })
      .andWhere('s.cid IS NOT NULL');

    // Добавляем фильтры по датам
    if (startDate && endDate) {
      query.andWhere('s."createdAt" BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('s."createdAt" >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('s."createdAt" <= :endDate', { endDate });
    }

    // Добавляем фильтры по колодам
    if (did) {
      query.andWhere('s.did = :did', { did });
    } else if (dids && dids.length > 0) {
      query.andWhere('s.did IN (:...dids)', { dids });
    }

    // Группировка и сортировка
    query
      .groupBy('daysSinceFirstReview')
      .orderBy('daysSinceFirstReview', 'ASC')
      .having('COUNT(*) >= 10'); // Минимальное количество данных для статистической значимости

    // Выполняем запрос
    const rawResults = await query.getRawMany();

    // Преобразуем результаты
    return rawResults.map((row) => ({
      daysSinceFirstReview: parseInt(row.daysSinceFirstReview),
      totalReviews: parseInt(row.totalReviews),
      correctAnswers: parseInt(row.correctAnswers),
      retentionRate:
        parseInt(row.totalReviews) > 0
          ? (parseInt(row.correctAnswers) / parseInt(row.totalReviews)) * 100
          : 0,
    }));
  }

  /**
   * Получить аналитику по кривой обучения
   */
  private async getLearningCurveAnalytics(
    uid: number,
    startDate?: Date,
    endDate?: Date,
    did?: number,
    dids?: number[],
  ): Promise<any[]> {
    // Используем SQL для построения кривой обучения
    const query = this.statisticRepository
      .createQueryBuilder('s')
      .select(
        `ROW_NUMBER() OVER (PARTITION BY s.cid ORDER BY s."createdAt")::integer`,
        'reviewNumber',
      )
      .addSelect(`COUNT(*)`, 'totalCards')
      .addSelect(
        `SUM(CASE WHEN s.data->>'isCorrect' = 'true' THEN 1 ELSE 0 END)`,
        'correctCards',
      )
      .where('s.uid = :uid', { uid })
      .andWhere('s.type = :type', { type: 'card_review' })
      .andWhere('s.cid IS NOT NULL');

    // Добавляем фильтры по датам
    if (startDate && endDate) {
      query.andWhere('s."createdAt" BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('s."createdAt" >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('s."createdAt" <= :endDate', { endDate });
    }

    // Добавляем фильтры по колодам
    if (did) {
      query.andWhere('s.did = :did', { did });
    } else if (dids && dids.length > 0) {
      query.andWhere('s.did IN (:...dids)', { dids });
    }

    // Группировка и сортировка
    query
      .groupBy('reviewNumber')
      .orderBy('reviewNumber', 'ASC')
      .having('COUNT(*) >= 5'); // Минимальное количество данных для статистической значимости

    // Выполняем запрос
    const rawResults = await query.getRawMany();

    // Преобразуем результаты
    return rawResults.map((row) => ({
      reviewNumber: parseInt(row.reviewNumber),
      totalCards: parseInt(row.totalCards),
      correctCards: parseInt(row.correctCards),
      successRate:
        parseInt(row.totalCards) > 0
          ? (parseInt(row.correctCards) / parseInt(row.totalCards)) * 100
          : 0,
    }));
  }

  /**
   * Получить аналитику по сложности карточек
   */
  private async getCardDifficultyAnalytics(
    uid: number,
    startDate?: Date,
    endDate?: Date,
    did?: number,
    dids?: number[],
    limit?: number,
  ): Promise<any[]> {
    // Используем SQL для расчета сложности карточек
    const query = this.statisticRepository
      .createQueryBuilder('s')
      .select('s.cid', 'cardId')
      .addSelect('MAX(c.front)', 'front')
      .addSelect('MAX(c.back)', 'back')
      .addSelect('COUNT(*)', 'totalReviews')
      .addSelect(
        `SUM(CASE WHEN s.data->>'isCorrect' = 'true' THEN 1 ELSE 0 END)`,
        'correctAnswers',
      )
      .addSelect(
        `COALESCE(AVG((s.data->>'timeSpentMs')::numeric), 0)`,
        'avgTimeSpentMs',
      )
      .innerJoin('cards', 'c', 's.cid = c.id')
      .where('s.uid = :uid', { uid })
      .andWhere('s.type = :type', { type: 'card_review' })
      .andWhere('s.cid IS NOT NULL');

    // Добавляем фильтры по датам
    if (startDate && endDate) {
      query.andWhere('s."createdAt" BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('s."createdAt" >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('s."createdAt" <= :endDate', { endDate });
    }

    // Добавляем фильтры по колодам
    if (did) {
      query.andWhere('s.did = :did', { did });
    } else if (dids && dids.length > 0) {
      query.andWhere('s.did IN (:...dids)', { dids });
    }

    // Группировка
    query
      .groupBy('s.cid')
      .having('COUNT(*) >= 3') // Минимальное количество обзоров для расчета сложности
      .orderBy('correctAnswers / COUNT(*)', 'ASC'); // Сортировка по возрастанию успешности (наиболее сложные первыми)

    // Ограничение количества результатов
    if (limit) {
      query.limit(limit);
    }

    // Выполняем запрос
    const rawResults = await query.getRawMany();

    // Преобразуем результаты
    return rawResults.map((row) => ({
      cardId: row.cardId,
      front: row.front,
      back: row.back,
      totalReviews: parseInt(row.totalReviews),
      correctAnswers: parseInt(row.correctAnswers),
      incorrectAnswers:
        parseInt(row.totalReviews) - parseInt(row.correctAnswers),
      accuracyRate:
        parseInt(row.totalReviews) > 0
          ? (parseInt(row.correctAnswers) / parseInt(row.totalReviews)) * 100
          : 0,
      avgTimeSpentMs: parseFloat(row.avgTimeSpentMs),
      difficultyScore:
        parseInt(row.totalReviews) > 0
          ? 100 -
            (parseInt(row.correctAnswers) / parseInt(row.totalReviews)) * 100
          : 50, // Шкала 0-100, где 100 - самые сложные
    }));
  }

  /**
   * Получить данные для тепловой карты повторений
   */
  private async getReviewHeatmapAnalytics(
    uid: number,
    startDate?: Date,
    endDate?: Date,
    did?: number,
    dids?: number[],
  ): Promise<any[]> {
    // Дата начала - год назад по умолчанию, если не указано
    const defaultStartDate =
      startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // Дата окончания - сегодня по умолчанию, если не указано
    const defaultEndDate = endDate || new Date();

    // Используем SQL для получения данных по дням
    const query = this.statisticRepository
      .createQueryBuilder('s')
      .select(`DATE_TRUNC('day', s."createdAt")::date`, 'date')
      .addSelect('COUNT(*)', 'count')
      .where('s.uid = :uid', { uid })
      .andWhere('s.type = :type', { type: 'card_review' })
      .andWhere('s."createdAt" BETWEEN :startDate AND :endDate', {
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      });

    // Добавляем фильтры по колодам
    if (did) {
      query.andWhere('s.did = :did', { did });
    } else if (dids && dids.length > 0) {
      query.andWhere('s.did IN (:...dids)', { dids });
    }

    // Группировка и сортировка
    query.groupBy('date').orderBy('date', 'ASC');

    // Выполняем запрос
    const rawResults = await query.getRawMany();

    // Генерируем полный список дат от начала до конца периода
    const allDates: string[] = [];
    const current = new Date(defaultStartDate);
    while (current <= defaultEndDate) {
      allDates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    // Преобразуем результаты в формат для тепловой карты
    const countMap = new Map<string, number>();
    rawResults.forEach((row) => {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      countMap.set(dateStr, parseInt(row.count));
    });

    // Создаем финальный массив с данными для всех дат
    return allDates.map((date) => ({
      date,
      count: countMap.get(date) || 0,
    }));
  }

  /**
   * Получить аналитику по времени повторений
   */
  private async getReviewTimeAnalytics(
    uid: number,
    startDate?: Date,
    endDate?: Date,
    interval: TimeInterval = TimeInterval.DAY,
    did?: number,
    dids?: number[],
  ): Promise<any[]> {
    // Используем SQL для получения данных по времени повторений
    const query = this.statisticRepository
      .createQueryBuilder('s')
      .select(`EXTRACT(HOUR FROM s."createdAt")::integer`, 'hour')
      .addSelect(`DATE_TRUNC('${interval}', s."createdAt")::date`, 'date')
      .addSelect('COUNT(*)', 'count')
      .where('s.uid = :uid', { uid })
      .andWhere('s.type = :type', { type: 'card_review' });

    // Добавляем фильтры по датам
    if (startDate && endDate) {
      query.andWhere('s."createdAt" BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.andWhere('s."createdAt" >= :startDate', { startDate });
    } else if (endDate) {
      query.andWhere('s."createdAt" <= :endDate', { endDate });
    }

    // Добавляем фильтры по колодам
    if (did) {
      query.andWhere('s.did = :did', { did });
    } else if (dids && dids.length > 0) {
      query.andWhere('s.did IN (:...dids)', { dids });
    }

    // Группировка и сортировка
    query
      .groupBy('hour, date')
      .orderBy('date', 'ASC')
      .addOrderBy('hour', 'ASC');

    // Выполняем запрос
    const rawResults = await query.getRawMany();

    // Если выбран интервал, отличный от дня, агрегируем данные
    if (interval !== TimeInterval.DAY) {
      // Агрегируем данные по часам для всех дат
      const hourlyData = Array(24)
        .fill(0)
        .map((_, hour) => ({
          hour,
          count: 0,
        }));

      // Суммируем количество повторений для каждого часа
      rawResults.forEach((row) => {
        const hour = parseInt(row.hour);
        const count = parseInt(row.count);
        hourlyData[hour].count += count;
      });

      return hourlyData;
    }

    // Для ежедневного интервала возвращаем данные с группировкой по дате и часу
    return rawResults.map((row) => ({
      date: row.date,
      hour: parseInt(row.hour),
      count: parseInt(row.count),
    }));
  }

  /**
   * Экспортировать данные статистики
   * @param params Параметры запроса
   */
  async exportStatistics(
    params: Omit<StatisticQueryParams, 'page' | 'limit'>,
  ): Promise<any[]> {
    const { uid, type, did, dids, cid, startDate, endDate } = params;

    const where: FindOptionsWhere<StatisticEntity> = { uid };

    if (type) {
      where.type = type;
    }

    if (did) {
      where.did = did;
    } else if (dids && dids.length > 0) {
      where.did = In(dids);
    }

    if (cid) {
      where.cid = cid;
    }

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = Between(startDate, new Date());
    } else if (endDate) {
      where.createdAt = Between(new Date(0), endDate);
    }

    // Используем left join для получения дополнительной информации
    const queryBuilder = this.statisticRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('cards', 'c', 's.cid = c.id')
      .leftJoinAndSelect('decks', 'd', 's.did = d.id')
      .where(where)
      .orderBy('s.createdAt', 'DESC');

    const entities = await queryBuilder.getRawMany();

    // Преобразуем результаты в плоский формат для экспорта
    return entities.map((entity) => {
      // Извлекаем основные поля
      const result = {
        id: entity.s_id,
        type: entity.s_type,
        uid: entity.s_uid,
        did: entity.s_did,
        deckName: entity.d_name || null,
        cid: entity.s_cid,
        cardFront: entity.c_front || null,
        cardBack: entity.c_back || null,
        createdAt: entity.s_createdAt,
        ...entity.s_data, // Разворачиваем JSON данные статистики
      };

      return result;
    });
  }
}
