import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FsrsReviewLog } from '../../../../domain/fsrs-review-log';
import { FsrsReviewLogEntity } from '../entities/fsrs-review-log.entity';
import { FsrsReviewLogMapper } from '../mappers/fsrs-review-log.mapper';
import { FsrsReviewLogRepository } from '../../fsrs-review-log.repository';

@Injectable()
export class FsrsReviewLogRelationalRepository
  implements FsrsReviewLogRepository
{
  constructor(
    @InjectRepository(FsrsReviewLogEntity)
    private readonly fsrsReviewLogRepository: Repository<FsrsReviewLogEntity>,
  ) {}

  async create(data: FsrsReviewLog): Promise<FsrsReviewLog> {
    const persistenceModel = FsrsReviewLogMapper.toPersistence(data);
    const newEntity = await this.fsrsReviewLogRepository.save(
      this.fsrsReviewLogRepository.create(persistenceModel),
    );
    return FsrsReviewLogMapper.toDomain(newEntity);
  }

  async findLastByFsrsCardId(
    fsrsCardId: string,
  ): Promise<FsrsReviewLog | null> {
    const entity = await this.fsrsReviewLogRepository.findOne({
      where: { fsrsCardId },
      order: { createdAt: 'DESC' },
    });

    return entity ? FsrsReviewLogMapper.toDomain(entity) : null;
  }

  async findByFsrsCardId(fsrsCardId: string): Promise<FsrsReviewLog[]> {
    const entities = await this.fsrsReviewLogRepository.find({
      where: { fsrsCardId },
      order: { createdAt: 'ASC' },
    });

    return entities.map((entity) => FsrsReviewLogMapper.toDomain(entity));
  }

  async remove(id: string): Promise<void> {
    await this.fsrsReviewLogRepository.delete(id);
  }

  async removeByFsrsCardId(fsrsCardId: string): Promise<void> {
    await this.fsrsReviewLogRepository.delete({ fsrsCardId });
  }
}
