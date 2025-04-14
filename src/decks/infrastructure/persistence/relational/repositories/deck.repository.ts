import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FSRSParameters, generatorParameters } from 'ts-fsrs';
import { DeckRepository } from '../../deck.repository';
import { DeckEntity } from '../entities/deck.entity';
import { Deck } from 'src/decks/domain/deck';
import { DeckMapper } from '../mappers/deck.mapper';
import { NullableType } from 'src/utils/types/nullable.type';
import { CardLimits } from 'src/fsrs/domain/card-limits';

@Injectable()
export class DeckRelationalRepository implements DeckRepository {
  constructor(
    @InjectRepository(DeckEntity)
    private readonly deckRepository: Repository<DeckEntity>,
  ) {}

  async create(data: Omit<Deck, 'id' | 'created' | 'updated'>): Promise<Deck> {
    const entity = this.deckRepository.create({
      ...data,
      created: Date.now(),
      updated: Date.now(),
    });

    const savedEntity = await this.deckRepository.save(entity);
    return DeckMapper.toDomain(savedEntity);
  }

  async findById(id: Deck['id'], uid: number): Promise<NullableType<Deck>> {
    const entity = await this.deckRepository.findOne({
      where: { id, uid },
    });

    return entity ? DeckMapper.toDomain(entity) : null;
  }

  async findAll(uid: number, deleted: boolean = false): Promise<Deck[]> {
    const entities = await this.deckRepository.find({
      where: { uid, deleted },
    });

    return entities.map((entity) => DeckMapper.toDomain(entity));
  }

  async update(
    id: Deck['id'],
    data: Partial<Deck>,
    uid: number,
  ): Promise<NullableType<Deck>> {
    await this.deckRepository.update(
      { id, uid },
      {
        ...data,
        updated: Date.now(),
      },
    );

    return this.findById(id, uid);
  }

  async softDelete(id: Deck['id'], uid: number): Promise<boolean> {
    const result = await this.deckRepository.update(
      { id, uid },
      { deleted: true },
    );

    if (!result) {
      throw new NotFoundException(`Deck with ${id} not found`);
    }

    return true;
  }

  async getDefaultDeck(uid: number): Promise<number> {
    const deck = await this.deckRepository.findOne({
      where: { uid, deleted: false },
      order: { id: 'ASC' },
    });

    if (deck) {
      return deck.id;
    }

    // Создаем новую колоду по умолчанию, если не существует
    const defaultParams: FSRSParameters = generatorParameters();

    const defaultLimits: CardLimits = {
      new: 50,
      review: Number.MAX_SAFE_INTEGER,
      learning: Number.MAX_SAFE_INTEGER,
      suspended: 8,
    };

    const newDeck = await this.deckRepository.save({
      uid,
      name: 'Default Deck',
      description: '',
      fsrs: defaultParams,
      card_limit: defaultLimits,
      deleted: false,
      created: Date.now(),
      updated: Date.now(),
    });

    return newDeck.id;
  }
}
