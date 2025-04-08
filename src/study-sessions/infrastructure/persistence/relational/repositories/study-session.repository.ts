import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StudySessionEntity } from '../entities/study-session.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { StudySession } from '../../../../domain/study-session';
import { StudySessionRepository } from '../../study-session.repository';
import { StudySessionMapper } from '../mappers/study-session.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class StudySessionRelationalRepository
  implements StudySessionRepository
{
  constructor(
    @InjectRepository(StudySessionEntity)
    private readonly studySessionRepository: Repository<StudySessionEntity>,
  ) {}

  async create(data: StudySession): Promise<StudySession> {
    const persistenceModel = StudySessionMapper.toPersistence(data);
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

  async findByIds(ids: StudySession['id'][]): Promise<StudySession[]> {
    const entities = await this.studySessionRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => StudySessionMapper.toDomain(entity));
  }

  async update(
    id: StudySession['id'],
    payload: Partial<StudySession>,
  ): Promise<StudySession> {
    const entity = await this.studySessionRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.studySessionRepository.save(
      this.studySessionRepository.create(
        StudySessionMapper.toPersistence({
          ...StudySessionMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return StudySessionMapper.toDomain(updatedEntity);
  }

  async remove(id: StudySession['id']): Promise<void> {
    await this.studySessionRepository.delete(id);
  }
}
