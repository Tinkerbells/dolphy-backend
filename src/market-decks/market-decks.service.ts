import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateMarketDeckDto } from './dto/create-market-deck.dto';
import { UpdateMarketDeckDto } from './dto/update-market-deck.dto';
import { MarketDeckRepository } from './infrastructure/persistence/market-deck.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { MarketDeck } from './domain/market-deck';
import { DecksService } from '../decks/decks.service';
import { CardsService } from '../cards/cards.service';
import { FindAllMarketDecksDto } from './dto/find-all-market-decks.dto';

@Injectable()
export class MarketDecksService {
  constructor(
    private readonly marketDeckRepository: MarketDeckRepository,
    private readonly decksService: DecksService,
    private readonly cardsService: CardsService,
  ) {}

  async create(
    createMarketDeckDto: CreateMarketDeckDto,
    userId: string,
  ): Promise<MarketDeck> {
    // Проверяем, существует ли оригинальная колода
    const originalDeck = await this.decksService.findById(
      createMarketDeckDto.deckId,
    );
    if (!originalDeck) {
      throw new NotFoundException('Оригинальная колода не найдена');
    }

    // Проверяем, имеет ли пользователь право публиковать эту колоду
    if (originalDeck.userId != userId) {
      throw new ForbiddenException('Вы не можете публиковать чужую колоду');
    }

    // Проверяем, не опубликована ли уже эта колода
    const existingMarketDeck = await this.marketDeckRepository.findByDeckId(
      createMarketDeckDto.deckId,
    );
    if (existingMarketDeck) {
      throw new BadRequestException('Эта колода уже опубликована');
    }

    // Получаем количество карточек в колоде
    const cards = await this.cardsService.findByDeckId(originalDeck.id);
    const cardsCount = cards.length;

    // Создаем запись о колоде в маркетплейсе
    const newMarketDeck = new MarketDeck();
    newMarketDeck.id = uuidv4();
    newMarketDeck.deckId = createMarketDeckDto.deckId;
    newMarketDeck.authorId = userId;
    newMarketDeck.downloadCount = 0;
    newMarketDeck.rating = 0;
    newMarketDeck.commentsCount = 0;
    newMarketDeck.cardsCount = cardsCount;
    newMarketDeck.deleted = false;

    return this.marketDeckRepository.create(newMarketDeck);
  }

  findAllWithPagination(
    findAllMarketDecksDto: FindAllMarketDecksDto,
  ): Promise<MarketDeck[]> {
    const page = findAllMarketDecksDto?.page ?? 1;
    const limit = findAllMarketDecksDto?.limit ?? 10;

    return this.marketDeckRepository.findAllWithPagination({
      paginationOptions: {
        page,
        limit,
      },
      authorId: findAllMarketDecksDto.authorId,
      searchQuery: findAllMarketDecksDto.q,
      tags: findAllMarketDecksDto.tags,
      sortBy: findAllMarketDecksDto.sortBy,
      sortDirection: findAllMarketDecksDto.sortDirection,
    });
  }

  findPopular({
    paginationOptions,
    sortBy = 'downloadCount',
  }: {
    paginationOptions: IPaginationOptions;
    sortBy?: 'downloadCount' | 'rating';
  }): Promise<MarketDeck[]> {
    return this.marketDeckRepository.findPopular({
      paginationOptions,
      sortBy,
    });
  }

  async findById(id: MarketDeck['id']): Promise<MarketDeck> {
    const marketDeck = await this.marketDeckRepository.findById(id);
    if (!marketDeck) {
      throw new NotFoundException('Колода не найдена');
    }
    return marketDeck;
  }

  async update(
    id: MarketDeck['id'],
    updateMarketDeckDto: UpdateMarketDeckDto,
    userId: string,
  ): Promise<MarketDeck> {
    const marketDeck = await this.marketDeckRepository.findById(id);
    if (!marketDeck) {
      throw new NotFoundException('Колода не найдена');
    }

    // Проверяем, имеет ли пользователь право обновлять эту колоду
    if (marketDeck.authorId !== userId) {
      throw new ForbiddenException('Вы не можете обновлять чужую колоду');
    }

    // Обновляем только разрешенные поля
    const updateData: Partial<MarketDeck> = {};

    const updatedDeck = await this.marketDeckRepository.update(id, updateData);
    if (!updatedDeck) {
      throw new NotFoundException('Не удалось обновить колоду');
    }

    return updatedDeck;
  }

  async incrementDownloadCount(id: MarketDeck['id']): Promise<MarketDeck> {
    const marketDeck =
      await this.marketDeckRepository.incrementDownloadCount(id);
    if (!marketDeck) {
      throw new NotFoundException('Колода не найдена');
    }
    return marketDeck;
  }

  async copyDeck(
    id: MarketDeck['id'],
    userId: string,
  ): Promise<{ id: string }> {
    const marketDeck = await this.marketDeckRepository.findById(id);
    if (!marketDeck) {
      throw new NotFoundException('Колода не найдена');
    }
    // Получаем оригинальную колоду
    const originalDeck = await this.decksService.findById(marketDeck.deckId);
    if (!originalDeck) {
      throw new NotFoundException('Оригинальная колода не найдена');
    }

    // Создаем копию колоды
    const copiedDeck = await this.decksService.create(
      {
        name: originalDeck.name,
        description: originalDeck.description,
      },
      userId,
    );

    // Копируем карточки из оригинальной колоды
    const originalCards = await this.cardsService.findByDeckId(originalDeck.id);

    // Получаем содержимое каждой карточки и создаем копию
    for (const card of originalCards) {
      const cardWithContent = await this.cardsService.findWithContent(card.id);
      if (cardWithContent && cardWithContent.note) {
        await this.cardsService.create(
          {
            question: cardWithContent.note.question,
            answer: cardWithContent.note.answer,
            deckId: copiedDeck.id,
            // TODO write typing or just Record
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            metadata: cardWithContent.note.extend,
          },
          userId,
        );
      }
    }

    // Увеличиваем счетчик скачиваний
    await this.incrementDownloadCount(id);

    return { id: copiedDeck.id };
  }

  async remove(id: MarketDeck['id'], userId: string): Promise<void> {
    const marketDeck = await this.marketDeckRepository.findById(id);
    if (!marketDeck) {
      throw new NotFoundException('Колода не найдена');
    }

    // Проверяем, имеет ли пользователь право удалять эту колоду
    if (marketDeck.authorId !== userId) {
      throw new ForbiddenException('Вы не можете удалять чужую колоду');
    }

    await this.marketDeckRepository.remove(id);
  }
}
