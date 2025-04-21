import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MarketDeckEntity } from '../entities/market-deck.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { MarketDeck } from '../../../../domain/market-deck';
import { MarketDeckRepository } from '../../market-deck.repository';
import { MarketDeckMapper } from '../mappers/market-deck.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { MarketDeckSortField } from '../../../../dto/find-all-market-decks.dto';

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
    authorId,
    searchQuery,
    tags,
    sortBy = MarketDeckSortField.CREATED_AT,
    sortDirection = 'DESC',
  }: {
    paginationOptions: IPaginationOptions;
    authorId?: string;
    searchQuery?: string;
    tags?: string[];
    sortBy?: MarketDeckSortField;
    sortDirection?: 'ASC' | 'DESC';
  }): Promise<MarketDeck[]> {
    const queryBuilder = this.marketDeckRepository
      .createQueryBuilder('market_deck')
      .where('market_deck.deleted = :deleted', { deleted: false });

    if (authorId) {
      queryBuilder.andWhere('market_deck.authorId = :authorId', { authorId });
    }

    if (searchQuery) {
      queryBuilder.andWhere(
        '(market_deck.title ILIKE :search OR market_deck.description ILIKE :search)',
        { search: `%${searchQuery}%` },
      );
    }

    if (tags && tags.length > 0) {
      // Для каждого тега добавляем условие, что он должен быть в массиве tags
      tags.forEach((tag, index) => {
        queryBuilder.andWhere(`market_deck.tags LIKE :tag${index}`, {
          [`tag${index}`]: `%${tag}%`,
        });
      });
    }

    // Сортировка
    queryBuilder.orderBy(`market_deck.${sortBy}`, sortDirection);

    // Пагинация
    const entities = await queryBuilder
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .getMany();

    return entities.map((entity) => MarketDeckMapper.toDomain(entity));
  }

  async findPopular({
    paginationOptions,
    sortBy = 'downloadCount',
  }: {
    paginationOptions: IPaginationOptions;
    sortBy?: 'downloadCount' | 'rating';
  }): Promise<MarketDeck[]> {
    const entities = await this.marketDeckRepository.find({
      where: { deleted: false },
      order: { [sortBy]: 'DESC' },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => MarketDeckMapper.toDomain(entity));
  }

  async findById(id: MarketDeck['id']): Promise<NullableType<MarketDeck>> {
    const entity = await this.marketDeckRepository.findOne({
      where: { id, deleted: false },
    });

    return entity ? MarketDeckMapper.toDomain(entity) : null;
  }

  async findByDeckId(deckId: string): Promise<NullableType<MarketDeck>> {
    const entity = await this.marketDeckRepository.findOne({
      where: { deckId, deleted: false },
    });

    return entity ? MarketDeckMapper.toDomain(entity) : null;
  }

  async findByIds(ids: MarketDeck['id'][]): Promise<MarketDeck[]> {
    const entities = await this.marketDeckRepository.find({
      where: { id: In(ids), deleted: false },
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
      throw new Error('MarketDeck not found');
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

  async incrementDownloadCount(
    id: MarketDeck['id'],
  ): Promise<MarketDeck | null> {
    const entity = await this.marketDeckRepository.findOne({
      where: { id, deleted: false },
    });

    if (!entity) {
      return null;
    }

    entity.downloadCount += 1;
    const updatedEntity = await this.marketDeckRepository.save(entity);

    return MarketDeckMapper.toDomain(updatedEntity);
  }

  async updateRating(
    id: MarketDeck['id'],
    newRating: number,
    commentCount: number,
  ): Promise<MarketDeck | null> {
    const entity = await this.marketDeckRepository.findOne({
      where: { id, deleted: false },
    });

    if (!entity) {
      return null;
    }

    entity.rating = newRating;
    entity.commentsCount = commentCount;
    const updatedEntity = await this.marketDeckRepository.save(entity);

    return MarketDeckMapper.toDomain(updatedEntity);
  }

  async remove(id: MarketDeck['id']): Promise<void> {
    await this.update(id, { deleted: true });
  }
}
