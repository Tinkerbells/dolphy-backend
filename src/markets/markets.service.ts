import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { MarketRepository } from './infrastructure/persistence/market.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Market } from './domain/market';

@Injectable()
export class MarketsService {
  constructor(
    // Dependencies here
    private readonly marketRepository: MarketRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createMarketDto: CreateMarketDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.marketRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.marketRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Market['id']) {
    return this.marketRepository.findById(id);
  }

  findByIds(ids: Market['id'][]) {
    return this.marketRepository.findByIds(ids);
  }

  async update(
    id: Market['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateMarketDto: UpdateMarketDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.marketRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Market['id']) {
    return this.marketRepository.remove(id);
  }
}
