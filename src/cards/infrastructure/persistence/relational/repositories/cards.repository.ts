import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CardsEntity } from '../entities/cards.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Cards } from '../../../../domain/cards';
import { CardsRepository } from '../../cards.repository';
import { CardsMapper } from '../mappers/cards.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class CardsRelationalRepository implements CardsRepository {
  constructor(
    @InjectRepository(CardsEntity)
    private readonly cardsRepository: Repository<CardsEntity>,
  ) {}

  async create(
    data: Omit<Cards, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Cards> {
    const persistenceModel = CardsMapper.toPersistence(data as Cards);
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
      order: { updatedAt: 'DESC' },
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

  async findByDeckId(deckId: string): Promise<Cards[]> {
    const entities = await this.cardsRepository.find({
      where: { deckId },
      order: { createdAt: 'ASC' },
    });

    return entities.map((entity) => CardsMapper.toDomain(entity));
  }

  async findByDeckIdWithPagination({
    deckId,
    paginationOptions,
  }: {
    deckId: string;
    paginationOptions: IPaginationOptions;
  }): Promise<Cards[]> {
    const entities = await this.cardsRepository.find({
      where: { deckId },
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      order: { createdAt: 'ASC' },
    });

    return entities.map((entity) => CardsMapper.toDomain(entity));
  }

  async findDueCards(userId: number, limit: number): Promise<Cards[]> {
    // Для этого метода потребуется дополнительное соединение с deck, чтобы проверить
    // принадлежность колоды пользователю. Предположим, что у нас есть связь с таблицей deck
    const now = new Date();
    const entities = await this.cardsRepository
      .createQueryBuilder('card')
      .innerJoin('card.deck', 'deck')
      .where('deck.ownerId = :userId', { userId })
      .andWhere(
        '(card.nextReviewDate IS NULL OR card.nextReviewDate <= :now)',
        { now },
      )
      .orderBy('card.nextReviewDate', 'ASC', 'NULLS FIRST')
      .take(limit)
      .getMany();

    return entities.map((entity) => CardsMapper.toDomain(entity));
  }

  async update(
    id: Cards['id'],
    payload: DeepPartial<Cards>,
  ): Promise<Cards | null> {
    const entity = await this.cardsRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    const updatedEntity = await this.cardsRepository.save(
      this.cardsRepository.create({
        ...entity,
        ...payload,
      }),
    );

    return CardsMapper.toDomain(updatedEntity);
  }

  async recordCorrectAnswer(
    id: Cards['id'],
    nextReviewDate: Date,
  ): Promise<Cards | null> {
    const entity = await this.cardsRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    entity.correctStreak += 1;
    entity.incorrectStreak = 0;
    entity.intervalStep += 1;
    entity.nextReviewDate = nextReviewDate;

    const updatedEntity = await this.cardsRepository.save(entity);
    return CardsMapper.toDomain(updatedEntity);
  }

  async recordIncorrectAnswer(
    id: Cards['id'],
    nextReviewDate: Date,
  ): Promise<Cards | null> {
    const entity = await this.cardsRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    entity.correctStreak = 0;
    entity.incorrectStreak += 1;
    entity.intervalStep = 0; // Сбрасываем шаг интервала
    entity.nextReviewDate = nextReviewDate;

    const updatedEntity = await this.cardsRepository.save(entity);
    return CardsMapper.toDomain(updatedEntity);
  }

  async remove(id: Cards['id']): Promise<void> {
    await this.cardsRepository.softDelete(id);
  }
}
