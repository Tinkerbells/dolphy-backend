import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { StudySession } from '../../domain/study-session';
import { StudySessionCard } from '../../domain/study-session-card';
import { CardAnswer } from '../../dto/answer-card.dto';

export abstract class StudySessionRepository {
  abstract create(
    data: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StudySession>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<StudySession[]>;

  abstract findById(
    id: StudySession['id'],
  ): Promise<NullableType<StudySession>>;

  abstract findByIdWithCards(
    id: StudySession['id'],
  ): Promise<NullableType<StudySession>>;

  abstract findByIds(ids: StudySession['id'][]): Promise<StudySession[]>;

  abstract update(
    id: StudySession['id'],
    payload: DeepPartial<StudySession>,
  ): Promise<StudySession | null>;

  abstract remove(id: StudySession['id']): Promise<void>;

  // Новые методы для работы с карточками в сессии

  abstract createStudySessionCard(
    data: Omit<StudySessionCard, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StudySessionCard>;

  abstract findStudySessionCardById(
    id: StudySessionCard['id'],
  ): Promise<NullableType<StudySessionCard>>;

  abstract findStudySessionCardBySessionIdAndCardId(
    sessionId: StudySessionCard['sessionId'],
    cardId: StudySessionCard['cardId'],
  ): Promise<NullableType<StudySessionCard>>;

  abstract getNextCardForStudySession(
    sessionId: StudySession['id'],
  ): Promise<NullableType<StudySessionCard>>;

  abstract updateStudySessionCard(
    id: StudySessionCard['id'],
    payload: DeepPartial<StudySessionCard>,
  ): Promise<StudySessionCard | null>;

  abstract recordCardAnswer(
    sessionId: StudySession['id'],
    cardId: string,
    answer: CardAnswer,
  ): Promise<{
    updatedSession: StudySession;
    updatedSessionCard: StudySessionCard;
  }>;
}
