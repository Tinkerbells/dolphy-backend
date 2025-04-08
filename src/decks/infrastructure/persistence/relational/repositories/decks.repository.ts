import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DecksEntity } from '../entities/decks.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Decks } from '../../../../domain/decks';
import { DecksRepository } from '../../decks.repository';
import { DecksMapper } from '../mappers/decks.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class DecksRelationalRepository implements DecksRepository {
  constructor(
    @InjectRepository(DecksEntity)
    private readonly decksRepository: Repository<DecksEntity>,
  ) {}

  async create(data: Decks): Promise<Decks> {
    const persistenceModel = DecksMapper.toPersistence(data);
    const newEntity = await this.decksRepository.save(
      this.decksRepository.create(persistenceModel),
    );
    return DecksMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Decks[]> {
    const entities = await this.decksRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => DecksMapper.toDomain(entity));
  }

  async findById(id: Decks['id']): Promise<NullableType<Decks>> {
    const entity = await this.decksRepository.findOne({
      where: { id },
    });

    return entity ? DecksMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Decks['id'][]): Promise<Decks[]> {
    const entities = await this.decksRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => DecksMapper.toDomain(entity));
  }

  async update(id: Decks['id'], payload: Partial<Decks>): Promise<Decks> {
    const entity = await this.decksRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.decksRepository.save(
      this.decksRepository.create(
        DecksMapper.toPersistence({
          ...DecksMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return DecksMapper.toDomain(updatedEntity);
  }

  async remove(id: Decks['id']): Promise<void> {
    await this.decksRepository.delete(id);
  }
}
