import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { UpdateStudySessionDto } from './dto/update-study-session.dto';
import { StudySessionRepository } from './infrastructure/persistence/study-session.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { StudySession } from './domain/study-session';
import { CardStatus } from './domain/study-session-card';
import { AnswerCardDto } from './dto/answer-card.dto';
import { NextCardResponseDto } from './dto/next-card-response.dto';
import { DecksRepository } from '../decks/infrastructure/persistence/decks.repository';
import { CardsRepository } from '../cards/infrastructure/persistence/cards.repository';
@Injectable()
export class StudySessionsService {
  constructor(
    private readonly studySessionRepository: StudySessionRepository,
    private readonly decksRepository: DecksRepository,
    private readonly cardsRepository: CardsRepository,
  ) {}

  async createStudySession(
    createStudySessionDto: CreateStudySessionDto,
  ): Promise<StudySession> {
    // Проверяем существование колоды
    const deck = await this.decksRepository.findById(
      createStudySessionDto.deckId,
    );
    if (!deck) {
      throw new NotFoundException(
        `Deck with id ${createStudySessionDto.deckId} not found`,
      );
    }

    // Получаем карточки из колоды
    const cards = await this.cardsRepository.findByDeckId(
      createStudySessionDto.deckId,
    );
    if (!cards || cards.length === 0) {
      throw new BadRequestException(
        `Deck with id ${createStudySessionDto.deckId} has no cards`,
      );
    }

    // Создаем новую сессию обучения
    const studySession = await this.studySessionRepository.create({
      userId: createStudySessionDto.userId,
      deckId: createStudySessionDto.deckId,
      totalCards: cards.length,
      cardsCompleted: 0,
      cardsCorrect: 0,
      isCompleted: false,
    });

    // Создаем карточки для сессии
    for (const card of cards) {
      await this.studySessionRepository.createStudySessionCard({
        sessionId: studySession.id,
        cardId: card.id,
        status: CardStatus.NEW,
        interval: 0,
        easeFactor: 2500, // Начальный фактор легкости (250%)
        consecutiveCorrect: 0,
        isCompleted: false,
        attempts: 0,
      });
    }

    const createdSessionWithCards =
      await this.studySessionRepository.findByIdWithCards(studySession.id);

    if (!createdSessionWithCards) {
      throw new NotFoundException(
        `Created study session with id ${studySession.id} not found`,
      );
    }
    return createdSessionWithCards;
  }

  async getNextCard(sessionId: string): Promise<NextCardResponseDto> {
    // Находим сессию
    const session = await this.studySessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(
        `Study session with id ${sessionId} not found`,
      );
    }

    // Если сессия уже завершена, возвращаем соответствующий ответ
    if (session.isCompleted) {
      return {
        card: null,
        progress: {
          total: session.totalCards,
          completed: session.cardsCompleted,
          remaining: session.totalCards - session.cardsCompleted,
          correct: session.cardsCorrect,
        },
        isSessionCompleted: true,
      };
    }

    // Получаем следующую карточку для изучения
    const nextSessionCard =
      await this.studySessionRepository.getNextCardForStudySession(sessionId);

    // Если нет доступных карточек, завершаем сессию
    if (!nextSessionCard) {
      await this.studySessionRepository.update(sessionId, {
        isCompleted: true,
      });

      // Получаем обновленную сессию
      const updatedSession =
        await this.studySessionRepository.findById(sessionId);
      if (!updatedSession) {
        throw new NotFoundException(
          `Updated study session with id ${sessionId} not found`,
        );
      }

      return {
        card: null,
        progress: {
          total: updatedSession.totalCards,
          completed: updatedSession.cardsCompleted,
          remaining: 0,
          correct: updatedSession.cardsCorrect,
        },
        isSessionCompleted: true,
      };
    }

    // Получаем данные карточки
    const card = await this.cardsRepository.findById(nextSessionCard.cardId);
    if (!card) {
      throw new NotFoundException(
        `Card with id ${nextSessionCard.cardId} not found`,
      );
    }

    // Формируем ответ
    return {
      card: {
        id: card.id,
        front: card.front,
        back: card.back,
        hint: card.hint,
      },
      progress: {
        total: session.totalCards,
        completed: session.cardsCompleted,
        remaining: session.totalCards - session.cardsCompleted,
        correct: session.cardsCorrect,
      },
      isSessionCompleted: false,
    };
  }

  async answerCard(
    sessionId: string,
    answerCardDto: AnswerCardDto,
  ): Promise<NextCardResponseDto> {
    // Находим сессию
    const session = await this.studySessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(
        `Study session with id ${sessionId} not found`,
      );
    }

    // Если сессия уже завершена, возвращаем ошибку
    if (session.isCompleted) {
      throw new BadRequestException('Study session is already completed');
    }

    // Проверяем, что карточка существует в сессии
    const sessionCard =
      await this.studySessionRepository.findStudySessionCardBySessionIdAndCardId(
        sessionId,
        answerCardDto.cardId,
      );

    if (!sessionCard) {
      throw new NotFoundException(
        `Card with id ${answerCardDto.cardId} not found in session ${sessionId}`,
      );
    }

    // Записываем ответ на карточку, применяя алгоритм интервального повторения
    await this.studySessionRepository.recordCardAnswer(
      sessionId,
      answerCardDto.cardId,
      answerCardDto.answer,
    );

    // Возвращаем следующую карточку
    return this.getNextCard(sessionId);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<StudySession[]> {
    return this.studySessionRepository.findAllWithPagination({
      paginationOptions,
    });
  }

  async findById(id: string): Promise<StudySession> {
    const session = await this.studySessionRepository.findByIdWithCards(id);
    if (!session) {
      throw new NotFoundException(`Study session with id ${id} not found`);
    }
    return session;
  }

  async update(
    id: string,
    updateStudySessionDto: UpdateStudySessionDto,
  ): Promise<StudySession> {
    const session = await this.studySessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Study session with id ${id} not found`);
    }

    const updatedSession = await this.studySessionRepository.update(
      id,
      updateStudySessionDto,
    );
    if (!updatedSession) {
      throw new BadRequestException(
        `Failed to update study session with id ${id}`,
      );
    }

    return updatedSession;
  }

  async remove(id: string): Promise<void> {
    const session = await this.studySessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Study session with id ${id} not found`);
    }

    return this.studySessionRepository.remove(id);
  }
}
