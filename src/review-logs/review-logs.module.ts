import { Module } from '@nestjs/common';
import { ReviewLogsService } from './review-logs.service';
import { ReviewLogsController } from './review-logs.controller';
import { RelationalReviewLogPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalReviewLogPersistenceModule],
  controllers: [ReviewLogsController],
  providers: [ReviewLogsService],
  exports: [ReviewLogsService, RelationalReviewLogPersistenceModule],
})
export class ReviewLogsModule {}
