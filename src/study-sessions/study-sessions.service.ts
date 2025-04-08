import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { UpdateStudySessionDto } from './dto/update-study-session.dto';
import { StudySessionRepository } from './infrastructure/persistence/study-session.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { StudySession } from './domain/study-session';

@Injectable()
export class StudySessionsService {
  constructor(
    // Dependencies here
    private readonly studySessionRepository: StudySessionRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createStudySessionDto: CreateStudySessionDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.studySessionRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.studySessionRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: StudySession['id']) {
    return this.studySessionRepository.findById(id);
  }

  findByIds(ids: StudySession['id'][]) {
    return this.studySessionRepository.findByIds(ids);
  }

  async update(
    id: StudySession['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateStudySessionDto: UpdateStudySessionDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.studySessionRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: StudySession['id']) {
    return this.studySessionRepository.remove(id);
  }
}
