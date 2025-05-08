import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMarketDeckDto } from './dto/create-market-deck.dto';
import { UpdateMarketDeckDto } from './dto/update-market-deck.dto';
import { MarketDeckRepository } from './infrastructure/persistence/market-deck.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { MarketDeck } from './domain/market-deck';
import { DecksService } from '../decks/decks.service';
import { CardsService } from '../cards/cards.service';
import { FindAllMarketDecksDto } from './dto/find-all-market-decks.dto';
import { OperationResultDto } from '../utils/dto/operation-result.dto';
import { I18nContext } from 'nestjs-i18n';

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
    const i18n = I18nContext.current();

    if (!i18n) {
      throw new Error('I18nContext is not available');
    }
    // Проверяем, существует ли оригинальная колода
    const originalDeck = await this.decksService.findById(
      createMarketDeckDto.deckId,
    );
    if (!originalDeck) {
      throw new NotFoundException(
        i18n.t('market-decks.errors.originalDeckNotFound'),
      );
    }

    // Проверяем, имеет ли пользователь право публиковать эту колоду
    if (originalDeck.userId != userId) {
      throw new ForbiddenException(i18n.t('market-decks.errors.noPermission'));
    }

    // Проверяем, не опубликована ли уже эта колода
    const existingMarketDeck = await this.marketDeckRepository.findByDeckId(
      createMarketDeckDto.deckId,
    );
    if (existingMarketDeck) {
      throw new BadRequestException(
        i18n.t('market-decks.errors.alreadyPublished'),
      );
    }

    // Получаем количество карточек в колоде
    const cards = await this.cardsService.findByDeckId(originalDeck.id);
    const cardsCount = cards.length;

    // Создаем запись о колоде в маркетплейсе
    const newMarketDeck = new MarketDeck();
    newMarketDeck.deckId = createMarketDeckDto.deckId;
    newMarketDeck.title = originalDeck.name;
    newMarketDeck.description = originalDeck.description;
    newMarketDeck.authorId = userId;
    newMarketDeck.downloadCount = 0;
    newMarketDeck.ratingBreakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
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
    const i18n = I18nContext.current();

    if (!i18n) {
      throw new Error('I18nContext is not available');
    }
    const marketDeck = await this.marketDeckRepository.findById(id);
    if (!marketDeck) {
      throw new NotFoundException(i18n.t('market-decks.notFound'));
    }
    return marketDeck;
  }

  async update(
    id: MarketDeck['id'],
    updateMarketDeckDto: UpdateMarketDeckDto,
    userId: string,
  ): Promise<MarketDeck> {
    const i18n = I18nContext.current();

    if (!i18n) {
      throw new Error('I18nContext is not available');
    }
    const marketDeck = await this.marketDeckRepository.findById(id);
    if (!marketDeck) {
      throw new NotFoundException(i18n.t('market-decks.notFound'));
    }

    // Проверяем, имеет ли пользователь право обновлять эту колоду
    if (marketDeck.authorId !== userId) {
      throw new ForbiddenException(i18n.t('market-decks.errors.noPermission'));
    }

    // Обновляем только разрешенные поля
    const updateData: Partial<MarketDeck> = {};

    const updatedDeck = await this.marketDeckRepository.update(id, updateData);
    if (!updatedDeck) {
      throw new NotFoundException(i18n.t('common.error'));
    }

    return updatedDeck;
  }

  async incrementDownloadCount(id: MarketDeck['id']): Promise<MarketDeck> {
    const i18n = I18nContext.current();

    if (!i18n) {
      throw new Error('I18nContext is not available');
    }
    const marketDeck =
      await this.marketDeckRepository.incrementDownloadCount(id);
    if (!marketDeck) {
      throw new NotFoundException(i18n.t('market-decks.notFound'));
    }
    return marketDeck;
  }

  async copyDeck(
    id: MarketDeck['id'],
    userId: string,
  ): Promise<{ id: string }> {
    const i18n = I18nContext.current();

    if (!i18n) {
      throw new Error('I18nContext is not available');
    }
    const marketDeck = await this.marketDeckRepository.findById(id);
    if (!marketDeck) {
      throw new NotFoundException(i18n.t('market-decks.notFound'));
    }
    // Получаем оригинальную колоду
    const originalDeck = await this.decksService.findById(marketDeck.deckId);
    if (!originalDeck) {
      throw new NotFoundException(
        i18n.t('market-decks.errors.originalDeckNotFound'),
      );
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

  async remove(
    id: MarketDeck['id'],
    userId: string,
  ): Promise<OperationResultDto> {
    const i18n = I18nContext.current();

    if (!i18n) {
      throw new Error('I18nContext is not available');
    }
    const marketDeck = await this.marketDeckRepository.findById(id);
    if (!marketDeck) {
      throw new NotFoundException(i18n.t('market-decks.notFound'));
    }

    // Проверяем, имеет ли пользователь право удалять эту колоду
    if (marketDeck.authorId !== userId) {
      throw new ForbiddenException(i18n.t('market-decks.errors.noPermission'));
    }

    await this.marketDeckRepository.remove(id);

    return {
      success: true,
      message: i18n.t('market-decks.deleted'),
    };
  }
}
