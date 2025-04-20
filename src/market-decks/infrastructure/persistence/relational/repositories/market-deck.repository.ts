import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MarketDeckEntity } from '../entities/market-deck.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { MarketDeck } from '../../../../domain/market-deck';
import { MarketDeckRepository } from '../../market-deck.repository';
import { MarketDeckMapper } from '../mappers/market-deck.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class MarketDeckRelationalRepository implements MarketDeckRepository {
  constructor(
    @InjectRepository(MarketDeckEntity)
    private readonly marketDeckRepository: Repository<MarketDeckEntity>,
  ) {}

  async create(data: MarketDeck): Promise<MarketDeck> {
    const persistenceModel = MarketDeckMapper.toPersistence(data);
    const newEntity = await this.marketDeckRepository.save(
      this.marketDeckRepository.create(persistenceModel),
    );
    return MarketDeckMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<MarketDeck[]> {
    const entities = await this.marketDeckRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => MarketDeckMapper.toDomain(entity));
  }

  async findById(id: MarketDeck['id']): Promise<NullableType<MarketDeck>> {
    const entity = await this.marketDeckRepository.findOne({
      where: { id },
    });

    return entity ? MarketDeckMapper.toDomain(entity) : null;
  }

  async findByIds(ids: MarketDeck['id'][]): Promise<MarketDeck[]> {
    const entities = await this.marketDeckRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => MarketDeckMapper.toDomain(entity));
  }

  async update(
    id: MarketDeck['id'],
    payload: Partial<MarketDeck>,
  ): Promise<MarketDeck> {
    const entity = await this.marketDeckRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.marketDeckRepository.save(
      this.marketDeckRepository.create(
        MarketDeckMapper.toPersistence({
          ...MarketDeckMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return MarketDeckMapper.toDomain(updatedEntity);
  }

  async remove(id: MarketDeck['id']): Promise<void> {
    await this.marketDeckRepository.delete(id);
  }
}
