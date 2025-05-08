import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMarketCommentDto } from './dto/create-market-comment.dto';
import { MarketCommentRepository } from './infrastructure/persistence/market-comment.repository';
import { MarketComment } from '../market-comments/domain/market-comment';
import { FindAllMarketCommentsDto } from './dto/find-all-market-comments.dto';
import { MarketDeckRepository } from 'src/market-decks/infrastructure/persistence/market-deck.repository';
import { OperationResultDto } from '../utils/dto/operation-result.dto';
import { t } from '../utils/i18n';

@Injectable()
export class MarketCommentsService {
  constructor(
    private readonly marketCommentRepository: MarketCommentRepository,
    private readonly marketDeckRepository: MarketDeckRepository,
  ) {}

  async create(
    createMarketCommentDto: CreateMarketCommentDto,
    userId: string,
  ): Promise<MarketComment> {
    // Проверяем, существует ли колода
    const marketDeck = await this.marketDeckRepository.findById(
      createMarketCommentDto.marketDeckId,
    );
    if (!marketDeck) {
      throw new NotFoundException(t('market-decks.notFound'));
    }

    // Проверяем, оставлял ли пользователь уже комментарий к этой колоде
    const existingComment =
      await this.marketCommentRepository.findByUserIdAndMarketDeckId(
        userId,
        createMarketCommentDto.marketDeckId,
      );
    if (existingComment) {
      throw new BadRequestException(
        t('market-comments.errors.alreadyCommented'),
      );
    }

    // Создаем комментарий
    const newComment = new MarketComment();
    newComment.marketDeckId = createMarketCommentDto.marketDeckId;
    newComment.userId = userId;
    newComment.text = createMarketCommentDto.text;
    newComment.rating = createMarketCommentDto.rating;
    newComment.deleted = false;

    // Сохраняем комментарий
    const savedComment = await this.marketCommentRepository.create(newComment);

    // Обновляем рейтинг колоды
    await this.updateDeckRating(createMarketCommentDto.marketDeckId);

    return savedComment;
  }

  findAllWithPagination(
    findAllMarketCommentsDto: FindAllMarketCommentsDto,
  ): Promise<MarketComment[]> {
    const page = findAllMarketCommentsDto?.page ?? 1;
    const limit = findAllMarketCommentsDto?.limit ?? 10;

    return this.marketCommentRepository.findAllWithPagination({
      paginationOptions: {
        page,
        limit,
      },
      marketDeckId: findAllMarketCommentsDto.marketDeckId,
      userId: findAllMarketCommentsDto.userId,
    });
  }

  async findByMarketDeckId(marketDeckId: string): Promise<MarketComment[]> {
    // Проверяем, существует ли колода
    const marketDeck = await this.marketDeckRepository.findById(marketDeckId);
    if (!marketDeck) {
      throw new NotFoundException(t('market-decks.notFound'));
    }

    return this.marketCommentRepository.findByMarketDeckId(marketDeckId);
  }

  async findById(id: MarketComment['id']): Promise<MarketComment> {
    const comment = await this.marketCommentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(t('market-comments.notFound'));
    }
    return comment;
  }

  async remove(
    id: MarketComment['id'],
    userId: string,
  ): Promise<OperationResultDto> {
    const comment = await this.marketCommentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(t('market-comments.notFound'));
    }

    // Проверяем, имеет ли пользователь право удалять этот комментарий
    if (comment.userId !== userId) {
      throw new ForbiddenException(t('market-comments.errors.noPermission'));
    }

    await this.marketCommentRepository.remove(id);

    // Обновляем рейтинг колоды
    await this.updateDeckRating(comment.marketDeckId);

    return {
      success: true,
      message: t('market-comments.deleted'),
    };
  }

  private async updateDeckRating(marketDeckId: string): Promise<void> {
    // Получаем все комментарии для колоды
    const comments =
      await this.marketCommentRepository.findByMarketDeckId(marketDeckId);

    const commentCount = comments.length;

    // Считаем распределение оценок
    const ratingBreakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    comments.forEach((comment) => {
      const rating = String(comment.rating);
      if (ratingBreakdown[rating] !== undefined) {
        ratingBreakdown[rating]++;
      }
    });

    // Обновляем рейтинг колоды и его распределение
    await this.marketDeckRepository.updateRating(
      marketDeckId,
      commentCount,
      ratingBreakdown,
    );
  }
}
