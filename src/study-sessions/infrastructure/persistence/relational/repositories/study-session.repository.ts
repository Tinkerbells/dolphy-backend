import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { StudySessionEntity } from '../entities/study-session.entity';
import { StudySessionCardEntity } from '../entities/study-session-card.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { StudySession } from '../../../../domain/study-session';
import {
  StudySessionCard,
  CardStatus,
} from '../../../../domain/study-session-card';
import { StudySessionRepository } from '../../study-session.repository';
import { StudySessionMapper } from '../mappers/study-session.mapper';
import { StudySessionCardMapper } from '../mappers/study-session-card.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { CardAnswer } from '../../../../dto/answer-card.dto';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class StudySessionRelationalRepository
  implements StudySessionRepository
{
  constructor(
    @InjectRepository(StudySessionEntity)
    private readonly studySessionRepository: Repository<StudySessionEntity>,
    @InjectRepository(StudySessionCardEntity)
    private readonly studySessionCardRepository: Repository<StudySessionCardEntity>,
  ) {}

  // Базовые методы для StudySession
  async create(
    data: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StudySession> {
    const persistenceModel = StudySessionMapper.toPersistence(
      data as StudySession,
    );
    const newEntity = await this.studySessionRepository.save(
      this.studySessionRepository.create(persistenceModel),
    );
    return StudySessionMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<StudySession[]> {
    const entities = await this.studySessionRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => StudySessionMapper.toDomain(entity));
  }

  async findById(id: StudySession['id']): Promise<NullableType<StudySession>> {
    const entity = await this.studySessionRepository.findOne({
      where: { id },
    });

    return entity ? StudySessionMapper.toDomain(entity) : null;
  }

  async findByIdWithCards(
    id: StudySession['id'],
  ): Promise<NullableType<StudySession>> {
    const entity = await this.studySessionRepository.findOne({
      where: { id },
      relations: ['cards', 'cards.card'],
    });

    return entity ? StudySessionMapper.toDomain(entity) : null;
  }

  async findByIds(ids: StudySession['id'][]): Promise<StudySession[]> {
    const entities = await this.studySessionRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => StudySessionMapper.toDomain(entity));
  }

  async update(
    id: StudySession['id'],
    payload: DeepPartial<StudySession>,
  ): Promise<StudySession> {
    const entity = await this.studySessionRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    // Исключаем свойство cards из payload, используем префикс "_" для переменной
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cards: _cards, ...payloadWithoutCards } = payload;

    // Объединяем существующую сущность с обновлениями
    const updatedEntity = await this.studySessionRepository.save({
      ...entity,
      ...payloadWithoutCards,
    });

    return StudySessionMapper.toDomain(updatedEntity);
  }

  async remove(id: StudySession['id']): Promise<void> {
    await this.studySessionRepository.delete(id);
  }

  // Методы для StudySessionCard
  async createStudySessionCard(
    data: Omit<StudySessionCard, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StudySessionCard> {
    const persistenceModel = StudySessionCardMapper.toPersistence(
      data as StudySessionCard,
    );
    const newEntity = await this.studySessionCardRepository.save(
      this.studySessionCardRepository.create(persistenceModel),
    );
    return StudySessionCardMapper.toDomain(newEntity);
  }

  async findStudySessionCardById(
    id: StudySessionCard['id'],
  ): Promise<NullableType<StudySessionCard>> {
    const entity = await this.studySessionCardRepository.findOne({
      where: { id },
      relations: ['card'],
    });

    return entity ? StudySessionCardMapper.toDomain(entity) : null;
  }

  async findStudySessionCardBySessionIdAndCardId(
    sessionId: StudySessionCard['sessionId'],
    cardId: StudySessionCard['cardId'],
  ): Promise<NullableType<StudySessionCard>> {
    const entity = await this.studySessionCardRepository.findOne({
      where: { sessionId, cardId },
      relations: ['card'],
    });

    return entity ? StudySessionCardMapper.toDomain(entity) : null;
  }

  async getNextCardForStudySession(
    sessionId: StudySession['id'],
  ): Promise<NullableType<StudySessionCard>> {
    // Приоритеты карточек:
    // 1. Неотвеченные новые карточки
    // 2. Карточки в процессе изучения, у которых наступило время повторения
    // 3. Карточки на повторении, у которых наступило время повторения

    // Сначала ищем новые неотвеченные карточки
    let entity = await this.studySessionCardRepository.findOne({
      where: {
        sessionId,
        isCompleted: false,
        status: CardStatus.NEW,
      },
      relations: ['card'],
      order: { createdAt: 'ASC' },
    });

    if (entity) {
      return StudySessionCardMapper.toDomain(entity);
    }

    const now = new Date();
    entity = await this.studySessionCardRepository.findOne({
      where: {
        sessionId,
        isCompleted: false,
        status: CardStatus.LEARNING,
        dueDate: LessThanOrEqual(now),
      },
      relations: ['card'],
      order: { dueDate: 'ASC' },
    });

    if (entity) {
      return StudySessionCardMapper.toDomain(entity);
    }

    entity = await this.studySessionCardRepository.findOne({
      where: {
        sessionId,
        isCompleted: false,
        status: CardStatus.REVIEW,
        dueDate: LessThanOrEqual(now),
      },
      relations: ['card'],
      order: { dueDate: 'ASC' },
    });

    if (entity) {
      return StudySessionCardMapper.toDomain(entity);
    }

    entity = await this.studySessionCardRepository.findOne({
      where: {
        sessionId,
        isCompleted: false,
        dueDate: MoreThanOrEqual(now),
      },
      relations: ['card'],
      order: { dueDate: 'ASC' },
    });

    return entity ? StudySessionCardMapper.toDomain(entity) : null;
  }

  async updateStudySessionCard(
    id: StudySessionCard['id'],
    payload: DeepPartial<StudySessionCard>,
  ): Promise<StudySessionCard> {
    const entity = await this.studySessionCardRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Study session card not found');
    }

    const newEntity = this.studySessionCardRepository.create({
      ...entity,
      ...payload,
    });

    const updatedEntity = await this.studySessionCardRepository.save(newEntity);

    return StudySessionCardMapper.toDomain(updatedEntity);
  }

  // Алгоритм интервального повторения в стиле Anki
  async recordCardAnswer(
    sessionId: StudySession['id'],
    cardId: string,
    answer: CardAnswer,
  ): Promise<{
    updatedSession: StudySession;
    updatedSessionCard: StudySessionCard;
  }> {
    // Найти сессию и карточку
    const session = await this.studySessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Study session not found');
    }

    const sessionCard = await this.studySessionCardRepository.findOne({
      where: { sessionId, cardId },
    });

    if (!sessionCard) {
      throw new Error('Card not found in study session');
    }

    // Обновить время последнего просмотра
    sessionCard.lastReviewedAt = new Date();
    sessionCard.lastAnswer = answer;
    sessionCard.attempts += 1;

    // Обработка ответа по алгоритму интервального повторения
    const now = new Date();

    // Базовый фактор легкости (начинается с 2500 = 250%)
    if (sessionCard.easeFactor === 0) {
      sessionCard.easeFactor = 2500;
    }

    // Применяем логику в зависимости от текущего статуса карточки и ответа
    switch (sessionCard.status) {
      case CardStatus.NEW:
        if (answer === CardAnswer.AGAIN) {
          // Неправильный ответ на новую карточку
          sessionCard.status = CardStatus.LEARNING;
          sessionCard.interval = 1; // 1 минута
          sessionCard.dueDate = new Date(now.getTime() + 1 * 60 * 1000);
          sessionCard.consecutiveCorrect = 0;
          // Уменьшаем фактор легкости
          sessionCard.easeFactor = Math.max(1300, sessionCard.easeFactor - 200);
        } else if (answer === CardAnswer.HARD) {
          sessionCard.status = CardStatus.LEARNING;
          sessionCard.interval = 5; // 5 минут
          sessionCard.dueDate = new Date(now.getTime() + 5 * 60 * 1000);
          sessionCard.consecutiveCorrect = 0;
        } else if (answer === CardAnswer.GOOD) {
          sessionCard.status = CardStatus.LEARNING;
          sessionCard.interval = 10; // 10 минут
          sessionCard.dueDate = new Date(now.getTime() + 10 * 60 * 1000);
          sessionCard.consecutiveCorrect = 1;
        } else if (answer === CardAnswer.EASY) {
          // Сразу переходим на этап повторения
          sessionCard.status = CardStatus.REVIEW;
          sessionCard.interval = 4 * 24 * 60; // 4 дня в минутах
          sessionCard.dueDate = new Date(
            now.getTime() + 4 * 24 * 60 * 60 * 1000,
          );
          sessionCard.consecutiveCorrect = 1;
          sessionCard.isCompleted = true; // Карточка считается завершенной в текущей сессии
          // Увеличиваем счетчики сессии
          session.cardsCompleted += 1;
          session.cardsCorrect += 1;
        }
        break;

      case CardStatus.LEARNING:
      case CardStatus.RELEARNING:
        if (answer === CardAnswer.AGAIN) {
          // Сбрасываем прогресс обучения
          sessionCard.interval = 1; // 1 минута
          sessionCard.dueDate = new Date(now.getTime() + 1 * 60 * 1000);
          sessionCard.consecutiveCorrect = 0;
          // Уменьшаем фактор легкости
          sessionCard.easeFactor = Math.max(1300, sessionCard.easeFactor - 200);
          sessionCard.status = CardStatus.LEARNING;
        } else if (answer === CardAnswer.HARD) {
          sessionCard.interval = 7; // 7 минут
          sessionCard.dueDate = new Date(now.getTime() + 7 * 60 * 1000);
          sessionCard.consecutiveCorrect = 0;
        } else if (answer === CardAnswer.GOOD) {
          // Увеличиваем интервал в зависимости от шага обучения
          if (sessionCard.consecutiveCorrect === 0) {
            sessionCard.interval = 10; // 10 минут
            sessionCard.dueDate = new Date(now.getTime() + 10 * 60 * 1000);
          } else {
            // Переход на этап повторения
            sessionCard.status = CardStatus.REVIEW;
            sessionCard.interval = 1 * 24 * 60; // 1 день в минутах
            sessionCard.dueDate = new Date(
              now.getTime() + 1 * 24 * 60 * 60 * 1000,
            );
            sessionCard.isCompleted = true; // Карточка считается завершенной в текущей сессии
            // Увеличиваем счетчики сессии
            session.cardsCompleted += 1;
            session.cardsCorrect += 1;
          }
          sessionCard.consecutiveCorrect += 1;
        } else if (answer === CardAnswer.EASY) {
          // Сразу переходим на этап повторения
          sessionCard.status = CardStatus.REVIEW;
          sessionCard.interval = 4 * 24 * 60; // 4 дня в минутах
          sessionCard.dueDate = new Date(
            now.getTime() + 4 * 24 * 60 * 60 * 1000,
          );
          sessionCard.consecutiveCorrect += 1;
          sessionCard.isCompleted = true; // Карточка считается завершенной в текущей сессии
          // Увеличиваем счетчики сессии
          session.cardsCompleted += 1;
          session.cardsCorrect += 1;
          // Увеличиваем фактор легкости
          sessionCard.easeFactor = Math.min(3000, sessionCard.easeFactor + 150);
        }
        break;

      case CardStatus.REVIEW:
        if (answer === CardAnswer.AGAIN) {
          // Переходим в режим переизучения
          sessionCard.status = CardStatus.RELEARNING;
          sessionCard.interval = 10; // 10 минут
          sessionCard.dueDate = new Date(now.getTime() + 10 * 60 * 1000);
          sessionCard.consecutiveCorrect = 0;
          // Уменьшаем фактор легкости
          sessionCard.easeFactor = Math.max(1300, sessionCard.easeFactor - 200);
        } else {
          // Обновляем интервал в зависимости от ответа
          // Базовый множитель для интервала
          const intervalModifier =
            answer === CardAnswer.HARD
              ? 1.2
              : answer === CardAnswer.GOOD
                ? 1.0
                : answer === CardAnswer.EASY
                  ? 1.3
                  : 1.0;

          // Новый интервал = текущий интервал * фактор легкости * модификатор
          const newInterval = Math.round(
            sessionCard.interval *
              (sessionCard.easeFactor / 1000) *
              intervalModifier,
          );

          // Обновляем фактор легкости
          if (answer === CardAnswer.HARD) {
            sessionCard.easeFactor = Math.max(
              1300,
              sessionCard.easeFactor - 150,
            );
          } else if (answer === CardAnswer.EASY) {
            sessionCard.easeFactor = Math.min(
              3000,
              sessionCard.easeFactor + 150,
            );
          }

          // Устанавливаем новый интервал (в минутах)
          sessionCard.interval = newInterval;

          // Устанавливаем дату следующего повторения
          sessionCard.dueDate = new Date(
            now.getTime() + newInterval * 60 * 1000,
          );

          // Увеличиваем счетчик правильных ответов подряд
          sessionCard.consecutiveCorrect += 1;

          // Помечаем карточку как завершенную в текущей сессии
          sessionCard.isCompleted = true;

          // Увеличиваем счетчики сессии
          session.cardsCompleted += 1;
          if (answer !== CardAnswer.HARD) {
            session.cardsCorrect += 1;
          }
        }
        break;
    }

    // Проверяем, завершена ли сессия
    if (session.cardsCompleted >= session.totalCards) {
      session.isCompleted = true;
    }

    // Сохраняем изменения
    const updatedSession = await this.studySessionRepository.save(session);
    const updatedSessionCard =
      await this.studySessionCardRepository.save(sessionCard);

    return {
      updatedSession: StudySessionMapper.toDomain(updatedSession),
      updatedSessionCard: StudySessionCardMapper.toDomain(updatedSessionCard),
    };
  }
}
