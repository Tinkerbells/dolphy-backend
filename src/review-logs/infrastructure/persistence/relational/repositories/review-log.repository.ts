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
    cardId,
  }: {
    paginationOptions: IPaginationOptions;
    cardId?: string;
  }): Promise<ReviewLog[]> {
    const queryBuilder = this.reviewLogRepository
      .createQueryBuilder('review_log')
      .where('review_log.deleted = :deleted', { deleted: false });

    if (cardId) {
      queryBuilder.andWhere('review_log.cardId = :cardId', { cardId });
    }

    const entities = await queryBuilder
      .orderBy('review_log.review', 'DESC')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .getMany();

    return entities.map((entity) => ReviewLogMapper.toDomain(entity));
  }

  async findById(id: ReviewLog['id']): Promise<NullableType<ReviewLog>> {
    const entity = await this.reviewLogRepository.findOne({
      where: { id, deleted: false },
    });

    return entity ? ReviewLogMapper.toDomain(entity) : null;
  }

  async findByIds(ids: ReviewLog['id'][]): Promise<ReviewLog[]> {
    const entities = await this.reviewLogRepository.find({
      where: {
        id: In(ids),
        deleted: false,
      },
    });

    return entities.map((entity) => ReviewLogMapper.toDomain(entity));
  }

  async findByCardId(cardId: string): Promise<ReviewLog[]> {
    const entities = await this.reviewLogRepository.find({
      where: { cardId, deleted: false },
      order: { review: 'DESC' },
    });

    return entities.map((entity) => ReviewLogMapper.toDomain(entity));
  }

  async findLatestByCardId(cardId: string): Promise<NullableType<ReviewLog>> {
    const entity = await this.reviewLogRepository.findOne({
      where: { cardId, deleted: false },
      order: { review: 'DESC' },
    });

    return entity ? ReviewLogMapper.toDomain(entity) : null;
  }

  async update(
    id: ReviewLog['id'],
    payload: Partial<ReviewLog>,
  ): Promise<ReviewLog> {
    const entity = await this.reviewLogRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('ReviewLog not found');
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
    // Мягкое удаление (soft delete)
    const entity = await this.reviewLogRepository.findOne({
      where: { id },
    });

    if (entity) {
      entity.deleted = true;
      await this.reviewLogRepository.save(entity);
    }
  }
}
