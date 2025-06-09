import { Module } from '@nestjs/common';
import { FsrsCardRepository } from '../fsrs-card.repository';
import { FsrsCardRelationalRepository } from './repositories/fsrs-card.repository';
import { FsrsReviewLogRepository } from '../fsrs-review-log.repository';
import { FsrsReviewLogRelationalRepository } from './repositories/fsrs-review-log.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FsrsCardEntity } from './entities/fsrs-card.entity';
import { FsrsReviewLogEntity } from './entities/fsrs-review-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FsrsCardEntity, FsrsReviewLogEntity])],
  providers: [
    {
      provide: FsrsCardRepository,
      useClass: FsrsCardRelationalRepository,
    },
    {
      provide: FsrsReviewLogRepository,
      useClass: FsrsReviewLogRelationalRepository,
    },
  ],
  exports: [FsrsCardRepository, FsrsReviewLogRepository],
})
export class RelationalFsrsPersistenceModule {}
