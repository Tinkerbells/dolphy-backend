import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateReviewLogDto } from './dto/create-review-log.dto';
import { UpdateReviewLogDto } from './dto/update-review-log.dto';
import { ReviewLogRepository } from './infrastructure/persistence/review-log.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { ReviewLog } from './domain/review-log';

@Injectable()
export class ReviewLogsService {
  constructor(
    // Dependencies here
    private readonly reviewLogRepository: ReviewLogRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createReviewLogDto: CreateReviewLogDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.reviewLogRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.reviewLogRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: ReviewLog['id']) {
    return this.reviewLogRepository.findById(id);
  }

  findByIds(ids: ReviewLog['id'][]) {
    return this.reviewLogRepository.findByIds(ids);
  }

  async update(
    id: ReviewLog['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateReviewLogDto: UpdateReviewLogDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.reviewLogRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: ReviewLog['id']) {
    return this.reviewLogRepository.remove(id);
  }
}
