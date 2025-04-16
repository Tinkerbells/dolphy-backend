import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ReviewLogEntity } from '../entities/review-log.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { ReviewLog } from '../../../../domain/review-log';
import { ReviewLogRepository } from '../../review-log.repository';
import { ReviewLogMapper } from '../mappers/review-log.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class ReviewLogRelationalRepository implements ReviewLogRepository {
  constructor(
    @InjectRepository(ReviewLogEntity)
    private readonly reviewLogRepository: Repository<ReviewLogEntity>,
  ) {}

  async create(data: ReviewLog): Promise<ReviewLog> {
    const persistenceModel = ReviewLogMapper.toPersistence(data);
    const newEntity = await this.reviewLogRepository.save(
      this.reviewLogRepository.create(persistenceModel),
    );
    return ReviewLogMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<ReviewLog[]> {
    const entities = await this.reviewLogRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => ReviewLogMapper.toDomain(entity));
  }

  async findById(id: ReviewLog['id']): Promise<NullableType<ReviewLog>> {
    const entity = await this.reviewLogRepository.findOne({
      where: { id },
    });

    return entity ? ReviewLogMapper.toDomain(entity) : null;
  }

  async findByIds(ids: ReviewLog['id'][]): Promise<ReviewLog[]> {
    const entities = await this.reviewLogRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => ReviewLogMapper.toDomain(entity));
  }

  async update(
    id: ReviewLog['id'],
    payload: Partial<ReviewLog>,
  ): Promise<ReviewLog> {
    const entity = await this.reviewLogRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.reviewLogRepository.save(
      this.reviewLogRepository.create(
        ReviewLogMapper.toPersistence({
          ...ReviewLogMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ReviewLogMapper.toDomain(updatedEntity);
  }

  async remove(id: ReviewLog['id']): Promise<void> {
    await this.reviewLogRepository.delete(id);
  }
}
