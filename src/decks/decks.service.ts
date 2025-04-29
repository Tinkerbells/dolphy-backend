import { Injectable } from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { DeckRepository } from './infrastructure/persistence/deck.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Deck } from './domain/deck';
import { v4 as uuidv4 } from 'uuid';
import { OperationResultDto } from '../utils/dto/operation-result.dto';

@Injectable()
export class DecksService {
  constructor(private readonly deckRepository: DeckRepository) {}

  async create(createDeckDto: CreateDeckDto, userId: string): Promise<Deck> {
    const newDeck = new Deck();
    newDeck.id = uuidv4();
    newDeck.name = createDeckDto.name;
    newDeck.description = createDeckDto.description || '';
    newDeck.userId = userId;
    newDeck.deleted = false;

    return this.deckRepository.create(newDeck);
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Deck[]> {
    return this.deckRepository.findAllWithPagination({
      paginationOptions,
    });
  }

  findByUserId(userId: string): Promise<Deck[]> {
    return this.deckRepository.findByUserId(userId);
  }

  findById(id: Deck['id']): Promise<Deck | null> {
    return this.deckRepository.findById(id);
  }

  findByIds(ids: Deck['id'][]): Promise<Deck[]> {
    return this.deckRepository.findByIds(ids);
  }

  async update(
    id: Deck['id'],
    updateDeckDto: UpdateDeckDto,
  ): Promise<Deck | null> {
    const updateData: Partial<Deck> = {};

    if (updateDeckDto.name !== undefined) {
      updateData.name = updateDeckDto.name;
    }

    if (updateDeckDto.description !== undefined) {
      updateData.description = updateDeckDto.description;
    }

    return this.deckRepository.update(id, updateData);
  }

  async softDelete(id: Deck['id']): Promise<OperationResultDto> {
    await this.deckRepository.update(id, { deleted: true });
    return {
      success: true,
      message: 'Deck successfully deleted',
    };
  }

  remove(id: Deck['id']): Promise<void> {
    return this.deckRepository.remove(id);
  }
}
