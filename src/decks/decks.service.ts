import { Injectable } from '@nestjs/common';
import { DeckRepository } from './infrastructure/persistence/deck.repository';
import { Deck } from './domain/deck';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { generatorParameters } from 'ts-fsrs';
import { FSRSParameters } from '../fsrs/domain/fsrs-parameters';
import { CardLimits } from '../fsrs/domain/card-limits';
import { NullableType } from '../utils/types/nullable.type';
import { CreateDeckDto } from './dto/create-decks.dto';
import { UpdateDeckDto } from './dto/update-decks.dto';

@Injectable()
export class DecksService {
  constructor(private readonly deckRepository: DeckRepository) {}

  async getDefaultDeck(uid: number): Promise<number> {
    return this.deckRepository.getDefaultDeck(uid);
  }

  async findAll(uid: number, deleted: boolean = false): Promise<Deck[]> {
    return this.deckRepository.findAll(uid, deleted);
  }

  async findById(id: number, uid: number): Promise<NullableType<Deck>> {
    return this.deckRepository.findById(id, uid);
  }

  async create(uid: number, dto: CreateDeckDto): Promise<Deck> {
    const defaultParams: FSRSParameters = dto.fsrs || generatorParameters();
    const defaultLimits: CardLimits = dto.card_limit || {
      new: 50,
      review: Number.MAX_SAFE_INTEGER,
      learning: Number.MAX_SAFE_INTEGER,
      suspended: 8,
    };

    return this.deckRepository.create({
      uid,
      name: dto.name,
      description: dto.description || '',
      fsrs: defaultParams,
      card_limit: defaultLimits,
      deleted: false,
    });
  }

  async update(
    id: number,
    uid: number,
    dto: UpdateDeckDto,
  ): Promise<NullableType<Deck>> {
    // Создаем объект с обновленными данными
    const updateData: DeepPartial<Deck> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.fsrs !== undefined) updateData.fsrs = dto.fsrs;
    if (dto.card_limit !== undefined) updateData.card_limit = dto.card_limit;

    return this.deckRepository.update(id, updateData, uid);
  }

  async remove(id: number, uid: number): Promise<boolean> {
    return this.deckRepository.softDelete(id, uid);
  }
}
