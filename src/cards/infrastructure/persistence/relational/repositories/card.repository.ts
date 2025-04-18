import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual } from 'typeorm';
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
    userId,
    deckId,
  }: {
    paginationOptions: IPaginationOptions;
    userId?: string;
    deckId?: string;
  }): Promise<Card[]> {
    const queryBuilder = this.cardRepository
      .createQueryBuilder('card')
      .where('card.deleted = :deleted', { deleted: false });

    if (userId) {
      queryBuilder.andWhere('card.userId = :userId', { userId });
    }

    if (deckId) {
      queryBuilder.andWhere('card.deckId = :deckId', { deckId });
    }

    const entities = await queryBuilder
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .getMany();

    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async findById(id: Card['id']): Promise<NullableType<Card>> {
    const entity = await this.cardRepository.findOne({
      where: { id, deleted: false },
    });

    return entity ? CardMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Card['id'][]): Promise<Card[]> {
    const entities = await this.cardRepository.find({
      where: {
        id: In(ids),
        deleted: false,
      },
    });

    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async findByDeckId(deckId: string): Promise<Card[]> {
    const entities = await this.cardRepository.find({
      where: {
        deckId,
        deleted: false,
      },
    });

    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async findDueCards(userId: string, now: Date): Promise<Card[]> {
    const entities = await this.cardRepository.find({
      where: {
        userId,
        due: LessThanOrEqual(now),
        suspended: LessThanOrEqual(now),
        deleted: false,
      },
      order: {
        due: 'ASC',
      },
    });

    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async findDueCardsByDeckId(deckId: string, now: Date): Promise<Card[]> {
    const entities = await this.cardRepository.find({
      where: {
        deckId,
        due: LessThanOrEqual(now),
        suspended: LessThanOrEqual(now),
        deleted: false,
      },
      order: {
        due: 'ASC',
      },
    });

    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async assignToDeck(cardId: string, deckId: string): Promise<Card | null> {
    const card = await this.findById(cardId);
    if (!card) {
      return null;
    }

    return this.update(cardId, { deckId });
  }

  // async removeFromDeck(cardId: string): Promise<Card | null> {
  //   const card = await this.findById(cardId);
  //   if (!card) {
  //     return null;
  //   }
  //
  //   return this.update(cardId);
  // }

  async update(id: Card['id'], payload: Partial<Card>): Promise<Card> {
    const entity = await this.cardRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Card not found');
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
    // Мягкое удаление
    await this.update(id, { deleted: true });
  }
}
