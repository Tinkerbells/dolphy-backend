import { Injectable } from '@nestjs/common';
import {
  StatisticRepository,
  StatisticQueryParams,
  AnalyticsQueryParams,
} from './infrastructure/persistence/statistic.repository';
import { Statistic } from './domain/statistic';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { NullableType } from '../utils/types/nullable.type';
import { AnalyticsType } from './dto/get-analytics.dto';
import { State } from 'ts-fsrs';

/**
 * Сервис для работы со статистикой обучения
 */
@Injectable()
export class StatisticsService {
  /**
   * Конструктор
   * @param statisticRepository Репозиторий статистики
   */
  constructor(private readonly statisticRepository: StatisticRepository) {}

  /**
   * Создать новую запись статистики
   * @param uid ID пользователя
   * @param createStatisticDto DTO с данными для создания
   */
  async create(
    uid: number,
    createStatisticDto: CreateStatisticDto,
  ): Promise<Statistic> {
    const statData: Omit<Statistic, 'id' | 'createdAt' | 'updatedAt'> = {
      uid,
      did: createStatisticDto.did,
      cid: createStatisticDto.cid,
      type: createStatisticDto.type,
      data: createStatisticDto.data,
    };

    return this.statisticRepository.create(statData);
  }

  /**
   * Записать информацию о результате повторения карточки
   * @param uid ID пользователя
   * @param cid ID карточки
   * @param did ID колоды
   * @param isCorrect Флаг успешного ответа
   * @param timeSpentMs Время, затраченное на ответ (мс)
   * @param cardState Состояние карточки
   */
  async recordCardReview(
    uid: number,
    cid: number,
    did: number,
    isCorrect: boolean,
    timeSpentMs: number,
    cardState: State,
  ): Promise<Statistic> {
    const statData: Omit<Statistic, 'id' | 'createdAt' | 'updatedAt'> = {
      uid,
      did,
      cid,
      type: 'card_review',
      data: {
        isCorrect,
        timeSpentMs,
        cardState,
        timestamp: Date.now(),
      },
    };

    return this.statisticRepository.create(statData);
  }

  /**
   * Записать информацию о начале сессии обучения
   * @param uid ID пользователя
   * @param did ID колоды
   * @param totalCards Общее количество карточек
   */
  async recordStudySessionStart(
    uid: number,
    did: number,
    totalCards: number,
  ): Promise<Statistic> {
    const statData: Omit<Statistic, 'id' | 'createdAt' | 'updatedAt'> = {
      uid,
      did,
      type: 'study_session',
      data: {
        totalCards,
        cardsCompleted: 0,
        cardsCorrect: 0,
        isCompleted: false,
        startTime: Date.now(),
      },
    };

    return this.statisticRepository.create(statData);
  }

  /**
   * Обновить информацию о сессии обучения
   * @param id ID записи статистики
   * @param uid ID пользователя
   * @param cardsCompleted Количество завершенных карточек
   * @param cardsCorrect Количество правильных ответов
   * @param isCompleted Флаг завершения сессии
   */
  async updateStudySession(
    id: string,
    uid: number,
    cardsCompleted: number,
    cardsCorrect: number,
    isCompleted: boolean,
  ): Promise<NullableType<Statistic>> {
    // Получаем текущую запись
    const currentSession = await this.statisticRepository.findById(id, uid);

    if (!currentSession || currentSession.type !== 'study_session') {
      return null;
    }

    // Создаем объект с обновленными данными
    const updatedData: DeepPartial<Statistic> = {
      data: {
        ...currentSession.data,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        cardsCompleted,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        cardsCorrect,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        isCompleted,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        endTime: isCompleted ? Date.now() : undefined,
      },
    };

    return this.statisticRepository.update(id, updatedData, uid);
  }

  /**
   * Найти запись статистики по ID
   * @param id ID записи
   * @param uid ID пользователя
   */
  async findById(id: string, uid: number): Promise<NullableType<Statistic>> {
    return this.statisticRepository.findById(id, uid);
  }

  /**
   * Найти все записи статистики с пагинацией и фильтрацией
   * @param params Параметры запроса
   */
  async findAll(params: StatisticQueryParams): Promise<{
    data: Statistic[];
    total: number;
  }> {
    return this.statisticRepository.findAll(params);
  }

  /**
   * Обновить запись статистики
   * @param id ID записи
   * @param uid ID пользователя
   * @param updateStatisticDto DTO с данными для обновления
   */
  async update(
    id: string,
    uid: number,
    updateStatisticDto: UpdateStatisticDto,
  ): Promise<NullableType<Statistic>> {
    // Преобразуем DTO в объект для обновления
    const updateData: DeepPartial<Statistic> = {};

    if (updateStatisticDto.type !== undefined) {
      updateData.type = updateStatisticDto.type;
    }

    if (updateStatisticDto.did !== undefined) {
      updateData.did = updateStatisticDto.did;
    }

    if (updateStatisticDto.cid !== undefined) {
      updateData.cid = updateStatisticDto.cid;
    }

    if (updateStatisticDto.data !== undefined) {
      updateData.data = updateStatisticDto.data;
    }

    return this.statisticRepository.update(id, updateData, uid);
  }

  /**
   * Удалить запись статистики
   * @param id ID записи
   * @param uid ID пользователя
   */
  async remove(id: string, uid: number): Promise<boolean> {
    return this.statisticRepository.remove(id, uid);
  }

  /**
   * Получить ежедневную статистику
   * @param uid ID пользователя
   * @param date Дата
   * @param did ID колоды (опционально)
   */
  async getDailyStatistics(
    uid: number,
    date: Date,
    did?: number,
  ): Promise<Record<string, any>> {
    return this.statisticRepository.getDailyStatistics(uid, date, did);
  }

  /**
   * Получить аналитические данные
   * @param params Параметры запроса
   */
  async getAnalytics(params: AnalyticsQueryParams): Promise<any[]> {
    return this.statisticRepository.getAnalytics(params);
  }

  /**
   * Экспортировать данные статистики
   * @param params Параметры запроса
   */
  async exportStatistics(
    params: Omit<StatisticQueryParams, 'page' | 'limit'>,
  ): Promise<any[]> {
    return this.statisticRepository.exportStatistics(params);
  }

  /**
   * Получить количество повторений за период с группировкой по состояниям
   * @param uid ID пользователя
   * @param range Временной диапазон [startTimestamp, endTimestamp]
   * @param states Массив состояний для фильтрации
   * @param dids Массив ID колод для фильтрации
   */
  async getRangeRevlogCount(
    uid: number,
    range: [number, number],
    states?: State[],
    dids?: number[],
  ): Promise<Map<State, number>> {
    // Преобразуем timestamp в объекты Date
    const startDate = new Date(range[0]);
    const endDate = new Date(range[1]);

    // Формируем параметры запроса
    const params: AnalyticsQueryParams = {
      uid,
      type: AnalyticsType.DAILY_STATS, // Используем тип для ежедневной статистики
      startDate,
      endDate,
      dids,
    };

    // Получаем аналитические данные
    const dailyStats = await this.statisticRepository.getAnalytics(params);

    // Создаем результат с группировкой по состояниям
    const result = new Map<State, number>();

    // Инициализируем счетчики для всех состояний
    if (!states || states.length === 0) {
      states = [State.New, State.Learning, State.Review, State.Relearning];
    }

    // Инициализируем счетчики нулями
    states.forEach((state) => {
      result.set(state, 0);
    });

    // Суммируем статистику по дням для каждого состояния
    for (const dayStat of dailyStats) {
      if (states.includes(State.New)) {
        result.set(
          State.New,
          (result.get(State.New) || 0) + (dayStat.newCards || 0),
        );
      }

      if (states.includes(State.Learning)) {
        result.set(
          State.Learning,
          (result.get(State.Learning) || 0) + (dayStat.learningCards || 0),
        );
      }

      if (states.includes(State.Review)) {
        result.set(
          State.Review,
          (result.get(State.Review) || 0) + (dayStat.reviewCards || 0),
        );
      }

      if (states.includes(State.Relearning)) {
        // Relearning обычно включается в learningCards, но если есть отдельный счетчик, можно добавить его здесь
        result.set(
          State.Relearning,
          (result.get(State.Relearning) || 0) + (dayStat.relearningCards || 0),
        );
      }
    }

    return result;
  }

  /**
   * Экспортировать логи повторений
   * @param uid ID пользователя
   * @param timeRange Временной диапазон [startTimestamp, endTimestamp]
   */
  async exportLogs(uid: number, timeRange?: [number, number]): Promise<any[]> {
    // Преобразуем timestamp в объекты Date, если они указаны
    const params: Omit<StatisticQueryParams, 'page' | 'limit'> = { uid };

    if (timeRange) {
      params.startDate = new Date(timeRange[0]);
      params.endDate = new Date(timeRange[1]);
    }

    // Указываем тип статистики 'card_review' для фильтрации только записей о повторениях карточек
    params.type = 'card_review';

    return this.statisticRepository.exportStatistics(params);
  }
}
