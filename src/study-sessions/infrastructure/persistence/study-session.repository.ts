import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { StudySession } from '../../domain/study-session';

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

  abstract findByIds(ids: StudySession['id'][]): Promise<StudySession[]>;

  abstract update(
    id: StudySession['id'],
    payload: DeepPartial<StudySession>,
  ): Promise<StudySession | null>;

  abstract remove(id: StudySession['id']): Promise<void>;
}
