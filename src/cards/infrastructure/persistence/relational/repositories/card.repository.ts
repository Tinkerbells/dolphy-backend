import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CardEntity } from '../entities/card.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Card } from '../../../../domain/card';
import { CardRepository } from '../../card.repository';
import { CardMapper } from '../mappers/card.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class CardRelationalRepository implements CardRepository {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
  ) {}

  async create(data: Card): Promise<Card> {
    const persistenceModel = CardMapper.toPersistence(data);
    const newEntity = await this.cardRepository.save(
      this.cardRepository.create(persistenceModel),
    );
    return CardMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Card[]> {
    const entities = await this.cardRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async findById(id: Card['id']): Promise<NullableType<Card>> {
    const entity = await this.cardRepository.findOne({
      where: { id },
    });

    return entity ? CardMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Card['id'][]): Promise<Card[]> {
    const entities = await this.cardRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async update(id: Card['id'], payload: Partial<Card>): Promise<Card> {
    const entity = await this.cardRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.cardRepository.save(
      this.cardRepository.create(
        CardMapper.toPersistence({
          ...CardMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CardMapper.toDomain(updatedEntity);
  }

  async remove(id: Card['id']): Promise<void> {
    await this.cardRepository.delete(id);
  }
}
