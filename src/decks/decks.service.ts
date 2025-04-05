import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Deck } from './entities/deck.entity';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { QueryDeckDto } from './dto/query-deck.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';

@Injectable()
export class DecksService {
  constructor(
    @InjectRepository(Deck)
    private readonly decksRepository: Repository<Deck>,
  ) {}

  // Создание новой колоды
  async create(createDeckDto: CreateDeckDto, userId: number): Promise<Deck> {
    const deck = this.decksRepository.create({
      ...createDeckDto,
      owner: { id: userId },
    });

    return this.decksRepository.save(deck);
  }

  // Получение всех публичных колод с пагинацией и фильтрацией
  async findAll(
    query: QueryDeckDto,
  ): Promise<InfinityPaginationResponseDto<Deck>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 50);

    const where: any = { isPublic: query.isPublic };

    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }

    if (query.ownerId) {
      where.owner = { id: query.ownerId };
    }

    const [data, total] = await this.decksRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { updatedAt: 'DESC' },
    });

    return infinityPagination(data, { page, limit });
  }

  // Получение колод текущего пользователя
  async findMyDecks(
    query: QueryDeckDto,
    userId: number,
  ): Promise<InfinityPaginationResponseDto<Deck>> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 50);

    const where: any = { owner: { id: userId } };

    if (query.search) {
      where.title = ILike(`%${query.search}%`);
    }

    if (query.isPublic !== undefined) {
      where.isPublic = query.isPublic;
    }

    const [data, total] = await this.decksRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { updatedAt: 'DESC' },
    });

    return infinityPagination(data, { page, limit });
  }

  // Получение колоды по ID
  async findOne(id: string): Promise<Deck> {
    const deck = await this.decksRepository.findOne({ where: { id } });

    if (!deck) {
      throw new NotFoundException(`Колода с ID ${id} не найдена`);
    }

    return deck;
  }

  // Обновление колоды
  async update(
    id: string,
    updateDeckDto: UpdateDeckDto,
    userId: number,
  ): Promise<Deck> {
    const deck = await this.findOne(id);

    // Проверяем, что пользователь является владельцем колоды
    if (deck.owner.id !== userId) {
      throw new ForbiddenException('Вы не являетесь владельцем этой колоды');
    }

    // Обновляем колоду
    await this.decksRepository.update(id, updateDeckDto);

    return this.findOne(id);
  }

  // Удаление колоды
  async remove(id: string, userId: number): Promise<void> {
    const deck = await this.findOne(id);

    // Проверяем, что пользователь является владельцем колоды
    if (deck.owner.id !== userId) {
      throw new ForbiddenException('Вы не являетесь владельцем этой колоды');
    }

    await this.decksRepository.softDelete(id);
  }

  // Обновление счетчика карточек
  async updateCardsCount(deckId: string): Promise<void> {
    const deck = await this.findOne(deckId);

    // Получаем количество карточек из базы данных
    const count = await this.decksRepository
      .createQueryBuilder('deck')
      .leftJoin('deck.cards', 'card')
      .where('deck.id = :deckId', { deckId })
      .andWhere('card.deletedAt IS NULL')
      .getCount();

    // Обновляем счетчик
    await this.decksRepository.update(deckId, { cardsCount: count });
  }
}
