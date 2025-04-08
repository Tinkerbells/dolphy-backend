import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CardsEntity } from '../entities/cards.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Cards } from '../../../../domain/cards';
import { CardsRepository } from '../../cards.repository';
import { CardsMapper } from '../mappers/cards.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class CardsRelationalRepository implements CardsRepository {
  constructor(
    @InjectRepository(CardsEntity)
    private readonly cardsRepository: Repository<CardsEntity>,
  ) {}

  async create(data: Cards): Promise<Cards> {
    const persistenceModel = CardsMapper.toPersistence(data);
    const newEntity = await this.cardsRepository.save(
      this.cardsRepository.create(persistenceModel),
    );
    return CardsMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Cards[]> {
    const entities = await this.cardsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => CardsMapper.toDomain(entity));
  }

  async findById(id: Cards['id']): Promise<NullableType<Cards>> {
    const entity = await this.cardsRepository.findOne({
      where: { id },
    });

    return entity ? CardsMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Cards['id'][]): Promise<Cards[]> {
    const entities = await this.cardsRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => CardsMapper.toDomain(entity));
  }

  async update(id: Cards['id'], payload: Partial<Cards>): Promise<Cards> {
    const entity = await this.cardsRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.cardsRepository.save(
      this.cardsRepository.create(
        CardsMapper.toPersistence({
          ...CardsMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CardsMapper.toDomain(updatedEntity);
  }

  async remove(id: Cards['id']): Promise<void> {
    await this.cardsRepository.delete(id);
  }
}
