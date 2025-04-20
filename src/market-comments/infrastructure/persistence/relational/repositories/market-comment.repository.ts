import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MarketCommentEntity } from '../entities/market-comment.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { MarketComment } from '../../../../../market-comments/domain/market-comment';
import { MarketCommentRepository } from '../../market-comment.repository';
import { MarketCommentMapper } from '../mappers/market-comment.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class MarketCommentRelationalRepository
  implements MarketCommentRepository
{
  constructor(
    @InjectRepository(MarketCommentEntity)
    private readonly marketCommentRepository: Repository<MarketCommentEntity>,
  ) {}

  async create(data: MarketComment): Promise<MarketComment> {
    const persistenceModel = MarketCommentMapper.toPersistence(data);
    const newEntity = await this.marketCommentRepository.save(
      this.marketCommentRepository.create(persistenceModel),
    );
    return MarketCommentMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
    marketDeckId,
    userId,
  }: {
    paginationOptions: IPaginationOptions;
    marketDeckId?: string;
    userId?: string;
  }): Promise<MarketComment[]> {
    const queryBuilder = this.marketCommentRepository
      .createQueryBuilder('market_comment')
      .where('market_comment.deleted = :deleted', { deleted: false });

    if (marketDeckId) {
      queryBuilder.andWhere('market_comment.marketDeckId = :marketDeckId', {
        marketDeckId,
      });
    }

    if (userId) {
      queryBuilder.andWhere('market_comment.userId = :userId', { userId });
    }

    queryBuilder.orderBy('market_comment.createdAt', 'DESC');

    const entities = await queryBuilder
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .getMany();

    return entities.map((entity) => MarketCommentMapper.toDomain(entity));
  }

  async findById(
    id: MarketComment['id'],
  ): Promise<NullableType<MarketComment>> {
    const entity = await this.marketCommentRepository.findOne({
      where: { id, deleted: false },
    });

    return entity ? MarketCommentMapper.toDomain(entity) : null;
  }

  async findByIds(ids: MarketComment['id'][]): Promise<MarketComment[]> {
    const entities = await this.marketCommentRepository.find({
      where: { id: In(ids), deleted: false },
    });

    return entities.map((entity) => MarketCommentMapper.toDomain(entity));
  }

  async findByMarketDeckId(marketDeckId: string): Promise<MarketComment[]> {
    const entities = await this.marketCommentRepository.find({
      where: { marketDeckId, deleted: false },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => MarketCommentMapper.toDomain(entity));
  }

  async findByUserIdAndMarketDeckId(
    userId: string,
    marketDeckId: string,
  ): Promise<NullableType<MarketComment>> {
    const entity = await this.marketCommentRepository.findOne({
      where: { userId, marketDeckId, deleted: false },
    });

    return entity ? MarketCommentMapper.toDomain(entity) : null;
  }

  async countByMarketDeckId(marketDeckId: string): Promise<number> {
    return this.marketCommentRepository.count({
      where: { marketDeckId, deleted: false },
    });
  }

  async getAverageRatingByMarketDeckId(marketDeckId: string): Promise<number> {
    const result = await this.marketCommentRepository
      .createQueryBuilder('market_comment')
      .select('AVG(market_comment.rating)', 'averageRating')
      .where('market_comment.marketDeckId = :marketDeckId', { marketDeckId })
      .andWhere('market_comment.deleted = :deleted', { deleted: false })
      .getRawOne();

    return result.averageRating ? parseFloat(result.averageRating) : 0;
  }

  async update(
    id: MarketComment['id'],
    payload: Partial<MarketComment>,
  ): Promise<MarketComment> {
    const entity = await this.marketCommentRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('MarketComment not found');
    }

    const updatedEntity = await this.marketCommentRepository.save(
      this.marketCommentRepository.create(
        MarketCommentMapper.toPersistence({
          ...MarketCommentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return MarketCommentMapper.toDomain(updatedEntity);
  }

  async remove(id: MarketComment['id']): Promise<void> {
    await this.update(id, { deleted: true });
  }
}
