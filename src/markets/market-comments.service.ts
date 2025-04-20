import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateMarketCommentDto } from './dto/create-market-comment.dto';
import { MarketCommentRepository } from './infrastructure/persistence/market-comment.repository';
import { MarketDeckRepository } from './infrastructure/persistence/market-deck.repository';
import { MarketComment } from './domain/market-comment';
import { FindAllMarketCommentsDto } from './dto/find-all-market-comments.dto';

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
      throw new NotFoundException('Колода не найдена');
    }

    // Проверяем, оставлял ли пользователь уже комментарий к этой колоде
    const existingComment =
      await this.marketCommentRepository.findByUserIdAndMarketDeckId(
        userId,
        createMarketCommentDto.marketDeckId,
      );
    if (existingComment) {
      throw new BadRequestException(
        'Вы уже оставили комментарий к этой колоде',
      );
    }

    // Создаем комментарий
    const newComment = new MarketComment();
    newComment.id = uuidv4();
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
      throw new NotFoundException('Колода не найдена');
    }

    return this.marketCommentRepository.findByMarketDeckId(marketDeckId);
  }

  async findById(id: MarketComment['id']): Promise<MarketComment> {
    const comment = await this.marketCommentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }
    return comment;
  }

  async remove(id: MarketComment['id'], userId: string): Promise<void> {
    const comment = await this.marketCommentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Проверяем, имеет ли пользователь право удалять этот комментарий
    if (comment.userId !== userId) {
      throw new ForbiddenException('Вы не можете удалять чужой комментарий');
    }

    await this.marketCommentRepository.remove(id);

    // Обновляем рейтинг колоды
    await this.updateDeckRating(comment.marketDeckId);
  }

  private async updateDeckRating(marketDeckId: string): Promise<void> {
    // Получаем средний рейтинг всех комментариев к колоде
    const averageRating =
      await this.marketCommentRepository.getAverageRatingByMarketDeckId(
        marketDeckId,
      );

    // Получаем количество комментариев к колоде
    const commentCount =
      await this.marketCommentRepository.countByMarketDeckId(marketDeckId);

    // Обновляем рейтинг и количество комментариев колоды
    await this.marketDeckRepository.updateRating(
      marketDeckId,
      averageRating,
      commentCount,
    );
  }
}
