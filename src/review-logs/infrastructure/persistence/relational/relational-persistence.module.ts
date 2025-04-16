import { Module } from '@nestjs/common';
import { ReviewLogRepository } from '../review-log.repository';
import { ReviewLogRelationalRepository } from './repositories/review-log.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewLogEntity } from './entities/review-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewLogEntity])],
  providers: [
    {
      provide: ReviewLogRepository,
      useClass: ReviewLogRelationalRepository,
    },
  ],
  exports: [ReviewLogRepository],
})
export class RelationalReviewLogPersistenceModule {}
