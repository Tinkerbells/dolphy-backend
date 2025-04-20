import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MarketEntity } from '../entities/market.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Market } from '../../../../domain/market';
import { MarketRepository } from '../../market.repository';
import { MarketMapper } from '../mappers/market.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class MarketRelationalRepository implements MarketRepository {
  constructor(
    @InjectRepository(MarketEntity)
    private readonly marketRepository: Repository<MarketEntity>,
  ) {}

  async create(data: Market): Promise<Market> {
    const persistenceModel = MarketMapper.toPersistence(data);
    const newEntity = await this.marketRepository.save(
      this.marketRepository.create(persistenceModel),
    );
    return MarketMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Market[]> {
    const entities = await this.marketRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => MarketMapper.toDomain(entity));
  }

  async findById(id: Market['id']): Promise<NullableType<Market>> {
    const entity = await this.marketRepository.findOne({
      where: { id },
    });

    return entity ? MarketMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Market['id'][]): Promise<Market[]> {
    const entities = await this.marketRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => MarketMapper.toDomain(entity));
  }

  async update(id: Market['id'], payload: Partial<Market>): Promise<Market> {
    const entity = await this.marketRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.marketRepository.save(
      this.marketRepository.create(
        MarketMapper.toPersistence({
          ...MarketMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return MarketMapper.toDomain(updatedEntity);
  }

  async remove(id: Market['id']): Promise<void> {
    await this.marketRepository.delete(id);
  }
}
