import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { StatisticEntity } from '../entities/statistic.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Statistic } from '../../../../domain/statistic';
import { StatisticRepository } from '../../statistic.repository';
import { StatisticMapper } from '../mappers/statistic.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class StatisticRelationalRepository implements StatisticRepository {
  constructor(
    @InjectRepository(StatisticEntity)
    private readonly statisticRepository: Repository<StatisticEntity>,
  ) {}

  async create(data: Statistic): Promise<Statistic> {
    const persistenceModel = StatisticMapper.toPersistence(data);
    const newEntity = await this.statisticRepository.save(
      this.statisticRepository.create(persistenceModel),
    );
    return StatisticMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Statistic[]> {
    const entities = await this.statisticRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => StatisticMapper.toDomain(entity));
  }

  async findById(id: Statistic['id']): Promise<NullableType<Statistic>> {
    const entity = await this.statisticRepository.findOne({
      where: { id },
    });

    return entity ? StatisticMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Statistic['id'][]): Promise<Statistic[]> {
    const entities = await this.statisticRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => StatisticMapper.toDomain(entity));
  }

  async update(
    id: Statistic['id'],
    payload: Partial<Statistic>,
  ): Promise<Statistic> {
    const entity = await this.statisticRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.statisticRepository.save(
      this.statisticRepository.create(
        StatisticMapper.toPersistence({
          ...StatisticMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return StatisticMapper.toDomain(updatedEntity);
  }

  async remove(id: Statistic['id']): Promise<void> {
    await this.statisticRepository.delete(id);
  }
}
