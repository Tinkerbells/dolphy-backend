import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DeckEntity } from '../entities/deck.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Deck } from '../../../../domain/deck';
import { DeckRepository } from '../../deck.repository';
import { DeckMapper } from '../mappers/deck.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class DeckRelationalRepository implements DeckRepository {
  constructor(
    @InjectRepository(DeckEntity)
    private readonly deckRepository: Repository<DeckEntity>,
  ) {}

  async create(data: Deck): Promise<Deck> {
    const persistenceModel = DeckMapper.toPersistence(data);
    const newEntity = await this.deckRepository.save(
      this.deckRepository.create(persistenceModel),
    );
    return DeckMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Deck[]> {
    const entities = await this.deckRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => DeckMapper.toDomain(entity));
  }

  async findById(id: Deck['id']): Promise<NullableType<Deck>> {
    const entity = await this.deckRepository.findOne({
      where: { id },
    });

    return entity ? DeckMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Deck['id'][]): Promise<Deck[]> {
    const entities = await this.deckRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => DeckMapper.toDomain(entity));
  }

  async update(id: Deck['id'], payload: Partial<Deck>): Promise<Deck> {
    const entity = await this.deckRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.deckRepository.save(
      this.deckRepository.create(
        DeckMapper.toPersistence({
          ...DeckMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return DeckMapper.toDomain(updatedEntity);
  }

  async remove(id: Deck['id']): Promise<void> {
    await this.deckRepository.delete(id);
  }
}
