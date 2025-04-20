import {
  // common
  Module,
} from '@nestjs/common';
import { MarketCommentsService } from './market-comments.service';
import { MarketCommentsController } from './market-comments.controller';
import { RelationalMarketCommentPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalMarketCommentPersistenceModule,
  ],
  controllers: [MarketCommentsController],
  providers: [MarketCommentsService],
  exports: [MarketCommentsService, RelationalMarketCommentPersistenceModule],
})
export class MarketCommentsModule {}
