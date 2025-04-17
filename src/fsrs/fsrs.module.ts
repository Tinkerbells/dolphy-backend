import { Module } from '@nestjs/common';
import { FsrsService } from './fsrs.service';
import { RelationalReviewLogPersistenceModule } from '../review-logs/infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalReviewLogPersistenceModule],
  providers: [FsrsService],
  exports: [FsrsService],
})
export class FsrsModule {}
