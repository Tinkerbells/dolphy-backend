import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateDecksDto } from './dto/create-decks.dto';
import { UpdateDecksDto } from './dto/update-decks.dto';
import { DecksRepository } from './infrastructure/persistence/decks.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Decks } from './domain/decks';

@Injectable()
export class DecksService {
  constructor(
    // Dependencies here
    private readonly decksRepository: DecksRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createDecksDto: CreateDecksDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.decksRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.decksRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Decks['id']) {
    return this.decksRepository.findById(id);
  }

  findByIds(ids: Decks['id'][]) {
    return this.decksRepository.findByIds(ids);
  }

  async update(
    id: Decks['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateDecksDto: UpdateDecksDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.decksRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Decks['id']) {
    return this.decksRepository.remove(id);
  }
}
