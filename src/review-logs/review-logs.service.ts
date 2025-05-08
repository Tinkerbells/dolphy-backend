import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewLogDto } from './dto/create-review-log.dto';
import { UpdateReviewLogDto } from './dto/update-review-log.dto';
import { ReviewLogRepository } from './infrastructure/persistence/review-log.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { ReviewLog } from './domain/review-log';
import { t } from '../utils/i18n';

@Injectable()
export class ReviewLogsService {
  constructor(private readonly reviewLogRepository: ReviewLogRepository) {}

  async create(createReviewLogDto: CreateReviewLogDto): Promise<ReviewLog> {
    const newReviewLog = new ReviewLog();
    newReviewLog.cardId = createReviewLogDto.cardId;
    newReviewLog.grade = createReviewLogDto.grade;
    newReviewLog.state = createReviewLogDto.state;
    newReviewLog.due = createReviewLogDto.due;
    newReviewLog.stability = createReviewLogDto.stability;
    newReviewLog.difficulty = createReviewLogDto.difficulty;
    newReviewLog.elapsed_days = createReviewLogDto.elapsed_days;
    newReviewLog.last_elapsed_days = createReviewLogDto.last_elapsed_days;
    newReviewLog.scheduled_days = createReviewLogDto.scheduled_days;
    newReviewLog.review = createReviewLogDto.review;
    newReviewLog.duration = createReviewLogDto.duration;
    newReviewLog.deleted = false;

    return this.reviewLogRepository.create(newReviewLog);
  }

  findAllWithPagination({
    paginationOptions,
    cardId,
  }: {
    paginationOptions: IPaginationOptions;
    cardId?: string;
  }): Promise<ReviewLog[]> {
    return this.reviewLogRepository.findAllWithPagination({
      paginationOptions,
      cardId,
    });
  }

  async findById(id: ReviewLog['id']): Promise<ReviewLog | null> {
    const reviewLog = await this.reviewLogRepository.findById(id);
    if (!reviewLog) {
      throw new NotFoundException(t('review-logs.notFound'));
    }
    return reviewLog;
  }

  findByIds(ids: ReviewLog['id'][]): Promise<ReviewLog[]> {
    return this.reviewLogRepository.findByIds(ids);
  }

  async findByCardId(cardId: string): Promise<ReviewLog[]> {
    const reviewLogs = await this.reviewLogRepository.findByCardId(cardId);
    return reviewLogs;
  }

  async findLatestByCardId(cardId: string): Promise<ReviewLog | null> {
    const reviewLog = await this.reviewLogRepository.findLatestByCardId(cardId);
    return reviewLog;
  }

  async update(
    id: ReviewLog['id'],
    updateReviewLogDto: UpdateReviewLogDto,
  ): Promise<ReviewLog | null> {
    const reviewLog = await this.reviewLogRepository.findById(id);
    if (!reviewLog) {
      throw new NotFoundException(t('review-logs.notFound'));
    }

    const updateData: Partial<ReviewLog> = {};

    if (updateReviewLogDto.grade !== undefined) {
      updateData.grade = updateReviewLogDto.grade;
    }

    if (updateReviewLogDto.state !== undefined) {
      updateData.state = updateReviewLogDto.state;
    }

    if (updateReviewLogDto.due !== undefined) {
      updateData.due = updateReviewLogDto.due;
    }

    if (updateReviewLogDto.stability !== undefined) {
      updateData.stability = updateReviewLogDto.stability;
    }

    if (updateReviewLogDto.difficulty !== undefined) {
      updateData.difficulty = updateReviewLogDto.difficulty;
    }

    if (updateReviewLogDto.elapsed_days !== undefined) {
      updateData.elapsed_days = updateReviewLogDto.elapsed_days;
    }

    if (updateReviewLogDto.last_elapsed_days !== undefined) {
      updateData.last_elapsed_days = updateReviewLogDto.last_elapsed_days;
    }

    if (updateReviewLogDto.scheduled_days !== undefined) {
      updateData.scheduled_days = updateReviewLogDto.scheduled_days;
    }

    if (updateReviewLogDto.review !== undefined) {
      updateData.review = updateReviewLogDto.review;
    }

    if (updateReviewLogDto.duration !== undefined) {
      updateData.duration = updateReviewLogDto.duration;
    }

    return this.reviewLogRepository.update(id, updateData);
  }

  async softDelete(id: ReviewLog['id']): Promise<void> {
    const reviewLog = await this.reviewLogRepository.findById(id);
    if (!reviewLog) {
      throw new NotFoundException(t('review-logs.notFound'));
    }

    await this.reviewLogRepository.update(id, { deleted: true });
  }

  async remove(id: ReviewLog['id']): Promise<void> {
    const reviewLog = await this.reviewLogRepository.findById(id);
    if (!reviewLog) {
      throw new NotFoundException(t('review-logs.notFound'));
    }

    return this.reviewLogRepository.remove(id);
  }

  async getCardStats(cardId: string): Promise<{
    totalReviews: number;
    correctReviews: number;
    averageDuration: number;
    lastReview: Date | null;
  }> {
    const logs = await this.reviewLogRepository.findByCardId(cardId);

    if (logs.length === 0) {
      return {
        totalReviews: 0,
        correctReviews: 0,
        averageDuration: 0,
        lastReview: null,
      };
    }

    // Подсчет статистики
    const totalReviews = logs.length;
    const correctReviews = logs.filter(
      (log) => log.grade === 'Good' || log.grade === 'Easy',
    ).length;

    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
    const averageDuration = totalDuration / totalReviews;

    // Сортировка журналов по времени повторения (от новых к старым)
    logs.sort((a, b) => b.review.getTime() - a.review.getTime());
    const lastReview = logs[0].review;

    return {
      totalReviews,
      correctReviews,
      averageDuration,
      lastReview,
    };
  }
}
