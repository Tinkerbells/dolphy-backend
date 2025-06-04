import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateFsrsDto } from './dto/create-fsrs.dto';
import { UpdateFsrsDto } from './dto/update-fsrs.dto';
import { FsrsRepository } from './infrastructure/persistence/fsrs.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Fsrs } from './domain/fsrs';

@Injectable()
export class FsrsService {
  constructor(
    // Dependencies here
    private readonly fsrsRepository: FsrsRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createFsrsDto: CreateFsrsDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.fsrsRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.fsrsRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Fsrs['id']) {
    return this.fsrsRepository.findById(id);
  }

  findByIds(ids: Fsrs['id'][]) {
    return this.fsrsRepository.findByIds(ids);
  }

  async update(
    id: Fsrs['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateFsrsDto: UpdateFsrsDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.fsrsRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Fsrs['id']) {
    return this.fsrsRepository.remove(id);
  }
}
