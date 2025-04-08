import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateCardsDto } from './dto/create-cards.dto';
import { UpdateCardsDto } from './dto/update-cards.dto';
import { CardsRepository } from './infrastructure/persistence/cards.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Cards } from './domain/cards';

@Injectable()
export class CardsService {
  constructor(
    // Dependencies here
    private readonly cardsRepository: CardsRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createCardsDto: CreateCardsDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.cardsRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.cardsRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Cards['id']) {
    return this.cardsRepository.findById(id);
  }

  findByIds(ids: Cards['id'][]) {
    return this.cardsRepository.findByIds(ids);
  }

  async update(
    id: Cards['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateCardsDto: UpdateCardsDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.cardsRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Cards['id']) {
    return this.cardsRepository.remove(id);
  }
}
