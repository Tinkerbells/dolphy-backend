import { Statistic } from '../../domain/statistic';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { AnalyticsType, TimeInterval } from '../../dto/get-analytics.dto';

/**
 * Тип для параметров запроса статистики
 */
export interface StatisticQueryParams {
  uid: number;
  type?: string;
  did?: number;
  dids?: number[];
  cid?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Тип для параметров запроса аналитики
 */
export interface AnalyticsQueryParams {
  uid: number;
  type: AnalyticsType;
  did?: number;
  dids?: number[];
  startDate?: Date;
  endDate?: Date;
  interval?: TimeInterval;
  limit?: number;
}

/**
 * Абстрактный класс репозитория статистики (порт)
 */
export abstract class StatisticRepository {
  /**
   * Создать новую запись статистики
   * @param data Данные для создания
   */
  abstract create(
    data: Omit<Statistic, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Statistic>;

  /**
   * Найти запись статистики по ID
   * @param id ID записи
   * @param uid ID пользователя
   */
  abstract findById(
    id: Statistic['id'],
    uid: number,
  ): Promise<NullableType<Statistic>>;

  /**
   * Найти все записи статистики с пагинацией и фильтрацией
   * @param params Параметры запроса
   */
  abstract findAll(params: StatisticQueryParams): Promise<{
    data: Statistic[];
    total: number;
  }>;

  /**
   * Обновить запись статистики
   * @param id ID записи
   * @param data Данные для обновления
   * @param uid ID пользователя
   */
  abstract update(
    id: Statistic['id'],
    data: DeepPartial<Statistic>,
    uid: number,
  ): Promise<NullableType<Statistic>>;

  /**
   * Удалить запись статистики
   * @param id ID записи
   * @param uid ID пользователя
   */
  abstract remove(id: Statistic['id'], uid: number): Promise<boolean>;

  /**
   * Получить агрегированные данные за день
   * @param uid ID пользователя
   * @param date Дата
   * @param did ID колоды (опционально)
   */
  abstract getDailyStatistics(
    uid: number,
    date: Date,
    did?: number,
  ): Promise<Record<string, any>>;

  /**
   * Получить аналитические данные
   * @param params Параметры запроса
   */
  abstract getAnalytics(params: AnalyticsQueryParams): Promise<any[]>;

  /**
   * Экспортировать данные статистики
   * @param params Параметры запроса
   */
  abstract exportStatistics(
    params: Omit<StatisticQueryParams, 'page' | 'limit'>,
  ): Promise<any[]>;
}
