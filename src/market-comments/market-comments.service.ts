import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateMarketCommentDto } from './dto/create-market-comment.dto';
import { UpdateMarketCommentDto } from './dto/update-market-comment.dto';
import { MarketCommentRepository } from './infrastructure/persistence/market-comment.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { MarketComment } from './domain/market-comment';

@Injectable()
export class MarketCommentsService {
  constructor(
    // Dependencies here
    private readonly marketCommentRepository: MarketCommentRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createMarketCommentDto: CreateMarketCommentDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.marketCommentRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.marketCommentRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: MarketComment['id']) {
    return this.marketCommentRepository.findById(id);
  }

  findByIds(ids: MarketComment['id'][]) {
    return this.marketCommentRepository.findByIds(ids);
  }

  async update(
    id: MarketComment['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateMarketCommentDto: UpdateMarketCommentDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.marketCommentRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: MarketComment['id']) {
    return this.marketCommentRepository.remove(id);
  }
}
