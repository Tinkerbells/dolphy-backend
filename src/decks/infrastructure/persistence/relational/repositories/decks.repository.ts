import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DecksEntity } from '../entities/decks.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Decks } from '../../../../domain/decks';
import { DecksRepository } from '../../decks.repository';
import { DecksMapper } from '../mappers/decks.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class DecksRelationalRepository implements DecksRepository {
  constructor(
    @InjectRepository(DecksEntity)
    private readonly decksRepository: Repository<DecksEntity>,
  ) {}

  async create(
    data: Omit<Decks, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Decks> {
    const persistenceModel = DecksMapper.toPersistence(data as Decks);
    const newEntity = await this.decksRepository.save(
      this.decksRepository.create(persistenceModel),
    );
    return DecksMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
    ownerId,
    isPublic,
  }: {
    paginationOptions: IPaginationOptions;
    ownerId?: number;
    isPublic?: boolean;
  }): Promise<Decks[]> {
    const whereClause: any = {};

    if (ownerId !== undefined) {
      whereClause.ownerId = ownerId;
    }

    if (isPublic !== undefined) {
      whereClause.isPublic = isPublic;
    }

    const entities = await this.decksRepository.find({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: { updatedAt: 'DESC' },
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

  async findByOwner(ownerId: number): Promise<Decks[]> {
    const entities = await this.decksRepository.find({
      where: { ownerId },
      order: { updatedAt: 'DESC' },
    });

    return entities.map((entity) => DecksMapper.toDomain(entity));
  }

  async findPublic(paginationOptions: IPaginationOptions): Promise<Decks[]> {
    const entities = await this.decksRepository.find({
      where: { isPublic: true },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: { updatedAt: 'DESC' },
    });

    return entities.map((entity) => DecksMapper.toDomain(entity));
  }

  async update(
    id: Decks['id'],
    payload: DeepPartial<Decks>,
  ): Promise<Decks | null> {
    const entity = await this.decksRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    const updatedEntity = await this.decksRepository.save(
      this.decksRepository.create({
        ...entity,
        ...payload,
      }),
    );

    return DecksMapper.toDomain(updatedEntity);
  }

  async incrementCardsCount(id: Decks['id']): Promise<Decks | null> {
    const entity = await this.decksRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    entity.cardsCount += 1;
    const updatedEntity = await this.decksRepository.save(entity);

    return DecksMapper.toDomain(updatedEntity);
  }

  async decrementCardsCount(id: Decks['id']): Promise<Decks | null> {
    const entity = await this.decksRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    if (entity.cardsCount > 0) {
      entity.cardsCount -= 1;
      const updatedEntity = await this.decksRepository.save(entity);
      return DecksMapper.toDomain(updatedEntity);
    }

    return DecksMapper.toDomain(entity);
  }

  async remove(id: Decks['id']): Promise<void> {
    await this.decksRepository.softDelete(id);
  }
}
