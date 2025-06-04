import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FsrsEntity } from '../entities/fsrs.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Fsrs } from '../../../../domain/fsrs';
import { FsrsRepository } from '../../fsrs-card.repository';
import { FsrsMapper } from '../mappers/fsrs-card.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class FsrsRelationalRepository implements FsrsRepository {
  constructor(
    @InjectRepository(FsrsEntity)
    private readonly fsrsRepository: Repository<FsrsEntity>,
  ) {}

  async create(data: Fsrs): Promise<Fsrs> {
    const persistenceModel = FsrsMapper.toPersistence(data);
    const newEntity = await this.fsrsRepository.save(
      this.fsrsRepository.create(persistenceModel),
    );
    return FsrsMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Fsrs[]> {
    const entities = await this.fsrsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => FsrsMapper.toDomain(entity));
  }

  async findById(id: Fsrs['id']): Promise<NullableType<Fsrs>> {
    const entity = await this.fsrsRepository.findOne({
      where: { id },
    });

    return entity ? FsrsMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Fsrs['id'][]): Promise<Fsrs[]> {
    const entities = await this.fsrsRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => FsrsMapper.toDomain(entity));
  }

  async update(id: Fsrs['id'], payload: Partial<Fsrs>): Promise<Fsrs> {
    const entity = await this.fsrsRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.fsrsRepository.save(
      this.fsrsRepository.create(
        FsrsMapper.toPersistence({
          ...FsrsMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return FsrsMapper.toDomain(updatedEntity);
  }

  async remove(id: Fsrs['id']): Promise<void> {
    await this.fsrsRepository.delete(id);
  }
}
