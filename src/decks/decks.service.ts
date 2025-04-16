import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { DeckRepository } from './infrastructure/persistence/deck.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Deck } from './domain/deck';

@Injectable()
export class DecksService {
  constructor(
    // Dependencies here
    private readonly deckRepository: DeckRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createDeckDto: CreateDeckDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.deckRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.deckRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Deck['id']) {
    return this.deckRepository.findById(id);
  }

  findByIds(ids: Deck['id'][]) {
    return this.deckRepository.findByIds(ids);
  }

  async update(
    id: Deck['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateDeckDto: UpdateDeckDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.deckRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Deck['id']) {
    return this.deckRepository.remove(id);
  }
}
