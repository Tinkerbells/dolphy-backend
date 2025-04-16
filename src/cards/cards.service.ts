import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardRepository } from './infrastructure/persistence/card.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Card } from './domain/card';

@Injectable()
export class CardsService {
  constructor(
    // Dependencies here
    private readonly cardRepository: CardRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createCardDto: CreateCardDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.cardRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.cardRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Card['id']) {
    return this.cardRepository.findById(id);
  }

  findByIds(ids: Card['id'][]) {
    return this.cardRepository.findByIds(ids);
  }

  async update(
    id: Card['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateCardDto: UpdateCardDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.cardRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Card['id']) {
    return this.cardRepository.remove(id);
  }
}
