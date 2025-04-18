import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { StatisticRepository } from './infrastructure/persistence/statistic.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Statistic } from './domain/statistic';

@Injectable()
export class StatisticsService {
  constructor(
    // Dependencies here
    private readonly statisticRepository: StatisticRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createStatisticDto: CreateStatisticDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.statisticRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.statisticRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Statistic['id']) {
    return this.statisticRepository.findById(id);
  }

  findByIds(ids: Statistic['id'][]) {
    return this.statisticRepository.findByIds(ids);
  }

  async update(
    id: Statistic['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateStatisticDto: UpdateStatisticDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.statisticRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Statistic['id']) {
    return this.statisticRepository.remove(id);
  }
}
