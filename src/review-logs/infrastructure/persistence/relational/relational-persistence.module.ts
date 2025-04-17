import { Module } from '@nestjs/common';
import { ReviewLogRepository } from '../review-log.repository';
import { ReviewLogRelationalRepository } from './repositories/review-log.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewLogEntity } from './entities/review-log.entity';
import { CardEntity } from 'src/cards/infrastructure/persistence/relational/entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewLogEntity, CardEntity])],
  providers: [
    {
      provide: ReviewLogRepository,
      useClass: ReviewLogRelationalRepository,
    },
  ],
  exports: [ReviewLogRepository],
})
export class RelationalReviewLogPersistenceModule {}
