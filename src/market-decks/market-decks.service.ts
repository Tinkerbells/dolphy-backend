import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateMarketDeckDto } from './dto/create-market-deck.dto';
import { UpdateMarketDeckDto } from './dto/update-market-deck.dto';
import { MarketDeckRepository } from './infrastructure/persistence/market-deck.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { MarketDeck } from './domain/market-deck';

@Injectable()
export class MarketDecksService {
  constructor(
    // Dependencies here
    private readonly marketDeckRepository: MarketDeckRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createMarketDeckDto: CreateMarketDeckDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.marketDeckRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.marketDeckRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: MarketDeck['id']) {
    return this.marketDeckRepository.findById(id);
  }

  findByIds(ids: MarketDeck['id'][]) {
    return this.marketDeckRepository.findByIds(ids);
  }

  async update(
    id: MarketDeck['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateMarketDeckDto: UpdateMarketDeckDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.marketDeckRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: MarketDeck['id']) {
    return this.marketDeckRepository.remove(id);
  }
}
