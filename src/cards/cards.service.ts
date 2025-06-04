import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardRepository } from './infrastructure/persistence/card.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Card } from './domain/card';
import { FsrsService } from '../fsrs/fsrs.service';
import { OperationResultDto } from '../utils/dto/operation-result.dto';
import { t } from 'src/utils/i18n';
import { RatingType } from 'ts-fsrs';

@Injectable()
export class CardsService {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly fsrsService: FsrsService,
  ) {}

  async create(createCardDto: CreateCardDto, userId: string): Promise<Card> {
    const savedCard = await this.cardRepository.create({
      ...createCardDto,
      userId: userId,
      deleted: false,
    });

    await this.fsrsService.initializeCard(savedCard.id);

    return savedCard;
  }

  async createMany(
    createCardDtos: CreateCardDto[],
    userId: string,
  ): Promise<Card[]> {
    const results: Card[] = [];

    for (const dto of createCardDtos) {
      const result = await this.create(dto, userId);
      results.push(result);
    }

    return results;
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
    return this.cardRepository.findAllWithPagination({
      paginationOptions,
      userId,
      deckId,
    });
  }

  async findById(id: Card['id']): Promise<Card | null> {
    return this.cardRepository.findById(id);
  }

  async findByIds(ids: Card['id'][]): Promise<Card[]> {
    return this.cardRepository.findByIds(ids);
  }

  async findByDeckId(deckId: string): Promise<Card[]> {
    return this.cardRepository.findByDeckId(deckId);
  }

  async findByUserId(userId: string): Promise<Card[]> {
    return this.cardRepository.findByUserId(userId);
  }

  async update(
    id: Card['id'],
    updateCardDto: UpdateCardDto,
  ): Promise<Card | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      return null;
    }

    // Создаем объект для обновления
    const updateData: Partial<Card> = {
      updatedAt: new Date(),
    };

    // Обновляем только те поля, которые переданы
    if (updateCardDto.question !== undefined) {
      updateData.question = updateCardDto.question;
    }

    if (updateCardDto.answer !== undefined) {
      updateData.answer = updateCardDto.answer;
    }

    if (updateCardDto.metadata !== undefined) {
      updateData.metadata = updateCardDto.metadata;
    }

    if (updateCardDto.deckId !== undefined) {
      updateData.deckId = updateCardDto.deckId;
    }

    return this.cardRepository.update(id, updateData);
  }

  async grade(
    id: Card['id'],
    rating: RatingType,
    userId: string,
  ): Promise<{ card: Card }> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    // Проверяем, что пользователь является владельцем карточки
    if (card.userId !== userId) {
      throw new ForbiddenException(t('cards.errors.noPermission'));
    }

    // Применяем оценку с помощью FSRS
    await this.fsrsService.applyRating(id, rating);

    return { card };
  }

  async suspend(
    id: Card['id'],
    until: Date,
    userId: string,
  ): Promise<Card | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    // Проверяем, что пользователь является владельцем карточки
    if (card.userId !== userId) {
      throw new ForbiddenException(t('cards.errors.noPermission'));
    }

    // Приостанавливаем FSRS карточку
    await this.fsrsService.suspendCard(id, until);

    return card;
  }

  async reset(id: Card['id'], userId: string): Promise<Card | null> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    // Проверяем, что пользователь является владельцем карточки
    if (card.userId !== userId) {
      throw new ForbiddenException(t('cards.errors.noPermission'));
    }

    // Сбрасываем FSRS карточку
    await this.fsrsService.resetCard(id);

    return card;
  }

  async undoGrade(id: Card['id'], userId: string): Promise<{ card: Card }> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    // Проверяем, что пользователь является владельцем карточки
    if (card.userId !== userId) {
      throw new ForbiddenException(t('cards.errors.noPermission'));
    }

    // Отменяем последнюю оценку через FSRS
    await this.fsrsService.undoLastRating(id);

    return { card };
  }

  async softDelete(
    id: Card['id'],
    userId: string,
  ): Promise<OperationResultDto> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    // Проверяем, что пользователь является владельцем карточки
    if (card.userId !== userId) {
      throw new ForbiddenException(t('cards.errors.noPermission'));
    }

    await this.cardRepository.update(id, { deleted: true });

    return {
      success: true,
      message: t('cards.deleted'),
    };
  }

  async restore(id: Card['id'], userId: string): Promise<OperationResultDto> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    // Проверяем, что пользователь является владельцем карточки
    if (card.userId !== userId) {
      throw new ForbiddenException(t('cards.errors.noPermission'));
    }

    await this.cardRepository.update(id, { deleted: false });

    return {
      success: true,
      message: t('cards.restored'),
    };
  }

  async remove(id: Card['id'], userId: string): Promise<void> {
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundException(t('cards.notFound'));
    }

    // Проверяем, что пользователь является владельцем карточки
    if (card.userId !== userId) {
      throw new ForbiddenException(t('cards.errors.noPermission'));
    }

    return this.cardRepository.remove(id);
  }
}
