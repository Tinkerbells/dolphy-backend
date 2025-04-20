import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MarketCommentEntity } from '../entities/market-comment.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { MarketComment } from '../../../../domain/market-comment';
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
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<MarketComment[]> {
    const entities = await this.marketCommentRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => MarketCommentMapper.toDomain(entity));
  }

  async findById(
    id: MarketComment['id'],
  ): Promise<NullableType<MarketComment>> {
    const entity = await this.marketCommentRepository.findOne({
      where: { id },
    });

    return entity ? MarketCommentMapper.toDomain(entity) : null;
  }

  async findByIds(ids: MarketComment['id'][]): Promise<MarketComment[]> {
    const entities = await this.marketCommentRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => MarketCommentMapper.toDomain(entity));
  }

  async update(
    id: MarketComment['id'],
    payload: Partial<MarketComment>,
  ): Promise<MarketComment> {
    const entity = await this.marketCommentRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
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
    await this.marketCommentRepository.delete(id);
  }
}
