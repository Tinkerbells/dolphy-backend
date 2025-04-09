import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateDecksDto } from './dto/create-decks.dto';
import { UpdateDecksDto } from './dto/update-decks.dto';
import { DecksRepository } from './infrastructure/persistence/decks.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Decks } from './domain/decks';

@Injectable()
export class DecksService {
  constructor(private readonly decksRepository: DecksRepository) {}

  async create(createDecksDto: CreateDecksDto): Promise<Decks> {
    return this.decksRepository.create({
      title: createDecksDto.title,
      description: createDecksDto.description,
      isPublic: createDecksDto.isPublic || false,
      cardsCount: 0,
      ownerId: createDecksDto.ownerId,
    });
  }

  findAllWithPagination({
    paginationOptions,
    ownerId,
    isPublic,
  }: {
    paginationOptions: IPaginationOptions;
    ownerId?: number;
    isPublic?: boolean;
  }): Promise<Decks[]> {
    return this.decksRepository.findAllWithPagination({
      paginationOptions,
      ownerId,
      isPublic,
    });
  }

  async findById(id: Decks['id']): Promise<Decks> {
    const deck = await this.decksRepository.findById(id);
    if (!deck) {
      throw new NotFoundException(`Колода с ID ${id} не найдена`);
    }
    return deck;
  }

  findByIds(ids: Decks['id'][]): Promise<Decks[]> {
    return this.decksRepository.findByIds(ids);
  }

  async findByOwner(ownerId: number): Promise<Decks[]> {
    return this.decksRepository.findByOwner(ownerId);
  }

  async findPublic(paginationOptions: IPaginationOptions): Promise<Decks[]> {
    return this.decksRepository.findPublic(paginationOptions);
  }

  async update(
    id: Decks['id'],
    updateDecksDto: UpdateDecksDto,
  ): Promise<Decks> {
    const deck = await this.decksRepository.findById(id);
    if (!deck) {
      throw new NotFoundException(`Колода с ID ${id} не найдена`);
    }

    const updatedDeck = await this.decksRepository.update(id, updateDecksDto);
    if (!updatedDeck) {
      throw new BadRequestException(`Не удалось обновить колоду с ID ${id}`);
    }

    return updatedDeck;
  }

  async incrementCardsCount(id: Decks['id']): Promise<Decks> {
    const deck = await this.decksRepository.findById(id);
    if (!deck) {
      throw new NotFoundException(`Колода с ID ${id} не найдена`);
    }

    const updatedDeck = await this.decksRepository.incrementCardsCount(id);
    if (!updatedDeck) {
      throw new BadRequestException(
        `Не удалось обновить счетчик карточек для колоды с ID ${id}`,
      );
    }

    return updatedDeck;
  }

  async decrementCardsCount(id: Decks['id']): Promise<Decks> {
    const deck = await this.decksRepository.findById(id);
    if (!deck) {
      throw new NotFoundException(`Колода с ID ${id} не найдена`);
    }

    const updatedDeck = await this.decksRepository.decrementCardsCount(id);
    if (!updatedDeck) {
      throw new BadRequestException(
        `Не удалось обновить счетчик карточек для колоды с ID ${id}`,
      );
    }

    return updatedDeck;
  }

  async remove(id: Decks['id']): Promise<void> {
    const deck = await this.decksRepository.findById(id);
    if (!deck) {
      throw new NotFoundException(`Колода с ID ${id} не найдена`);
    }

    return this.decksRepository.remove(id);
  }
}
