import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { DeckRepository } from './infrastructure/persistence/deck.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Deck } from './domain/deck';
import { v4 as uuidv4 } from 'uuid';
import { OperationResultDto } from '../utils/dto/operation-result.dto';
import { t } from '../utils/i18n';

@Injectable()
export class DecksService {
  constructor(private readonly deckRepository: DeckRepository) {}

  async create(createDeckDto: CreateDeckDto, userId: string): Promise<Deck> {
    if (createDeckDto.name.length > 100) {
      throw new BadRequestException(t('decks.errors.nameTooLong'));
    }

    if (createDeckDto.description && createDeckDto.description.length > 500) {
      throw new BadRequestException(t('decks.errors.descriptionTooLong'));
    }

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

  async findById(id: Deck['id']): Promise<Deck | null> {
    const deck = await this.deckRepository.findById(id);
    if (!deck) {
      throw new NotFoundException(t('decks.notFound'));
    }
    return deck;
  }

  findByIds(ids: Deck['id'][]): Promise<Deck[]> {
    return this.deckRepository.findByIds(ids);
  }

  async update(
    id: Deck['id'],
    updateDeckDto: UpdateDeckDto,
  ): Promise<Deck | null> {
    const deck = await this.deckRepository.findById(id);
    if (!deck) {
      throw new NotFoundException(t('decks.notFound'));
    }

    if (updateDeckDto.name && updateDeckDto.name.length > 100) {
      throw new BadRequestException(t('decks.errors.nameTooLong'));
    }

    if (updateDeckDto.description && updateDeckDto.description.length > 500) {
      throw new BadRequestException(t('decks.errors.descriptionTooLong'));
    }

    const updateData: Partial<Deck> = {};

    if (updateDeckDto.name !== undefined) {
      updateData.name = updateDeckDto.name;
    }

    if (updateDeckDto.description !== undefined) {
      updateData.description = updateDeckDto.description;
    }

    const updatedDeck = await this.deckRepository.update(id, updateData);
    if (!updatedDeck) {
      throw new BadRequestException(t('common.error'));
    }

    return updatedDeck;
  }

  async softDelete(id: Deck['id']): Promise<OperationResultDto> {
    const deck = await this.deckRepository.findById(id);
    if (!deck) {
      throw new NotFoundException(t('decks.notFound'));
    }

    await this.deckRepository.update(id, { deleted: true });

    return {
      success: true,
      message: t('decks.deleted'),
    };
  }

  async remove(id: Deck['id']): Promise<void> {
    const deck = await this.deckRepository.findById(id);
    if (!deck) {
      throw new NotFoundException(t('decks.notFound'));
    }

    return this.deckRepository.remove(id);
  }
}
