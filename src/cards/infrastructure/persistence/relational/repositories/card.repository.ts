import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CardEntity } from '../entities/card.entity';
import { CardRepository } from '../../card.repository';
import { CardMapper } from '../mappers/card.mapper';
import { Card } from '../../../../domain/card';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { State } from 'ts-fsrs';

@Injectable()
export class CardRelationalRepository implements CardRepository {
  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
  ) {}

  async create(data: Omit<Card, 'id' | 'created' | 'updated'>): Promise<Card> {
    const entity = this.cardRepository.create({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const savedEntity = await this.cardRepository.save(entity);
    return CardMapper.toDomain(savedEntity);
  }

  async findById(id: Card['id'], uid: number): Promise<NullableType<Card>> {
    const entity = await this.cardRepository.findOne({
      where: { id, uid },
      relations: ['note', 'note.deck'],
    });

    return entity ? CardMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Card['id'][], uid: number): Promise<Card[]> {
    const entities = await this.cardRepository.find({
      where: { id: In(ids), uid },
    });

    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async update(
    id: Card['id'],
    data: DeepPartial<Card>,
    uid: number,
  ): Promise<NullableType<Card>> {
    await this.cardRepository.update(
      { id, uid },
      {
        ...data,
        updatedAt: Date.now(),
      },
    );

    return this.findById(id, uid);
  }

  async bulkUpdate(
    ids: Card['id'][],
    data: DeepPartial<Card>,
    uid: number,
  ): Promise<number> {
    const result = await this.cardRepository.update(
      { id: In(ids), uid },
      {
        ...data,
        updatedAt: Date.now(),
      },
    );

    return result.affected || 0;
  }

  async findByDeckId(deckId: number, uid: number): Promise<Card[]> {
    const entities = await this.cardRepository.find({
      where: { did: deckId, uid, deleted: false },
    });

    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async findByNoteId(noteId: number, uid: number): Promise<Card[]> {
    const entities = await this.cardRepository.find({
      where: { nid: noteId, uid, deleted: false },
    });

    return entities.map((entity) => CardMapper.toDomain(entity));
  }

  async findDueCards(
    uid: number,
    timestamp: number,
    limit: number,
  ): Promise<Card[]> {
    // Запрос для карточек, которые нужно повторить (учитывает разные состояния)
    const query = this.cardRepository
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.note', 'n')
      .innerJoinAndSelect('c.note.deck', 'd')
      .where('c.uid = :uid', { uid })
      .andWhere('c.deleted = :deleted', { deleted: false })
      .andWhere('c.suspended = :suspended', { suspended: false })
      .andWhere(
        '(c.state = :reviewState AND c.due < :timestamp) OR c.state != :reviewState',
        {
          reviewState: State.Review,
          timestamp,
        },
      )
      .orderBy('c.due', 'ASC')
      .limit(limit);

    const entities = await query.getMany();

    return entities.map((entity) => CardMapper.toDomain(entity));
  }
}
