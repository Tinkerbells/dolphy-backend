import {
  // common
  Module,
} from '@nestjs/common';
import { MarketCommentsService } from './market-comments.service';
import { MarketCommentsController } from './market-comments.controller';
import { RelationalMarketCommentPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { MarketDecksModule } from 'src/market-decks/market-decks.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalMarketCommentPersistenceModule,
    MarketDecksModule,
  ],
  controllers: [MarketCommentsController],
  providers: [MarketCommentsService],
  exports: [MarketCommentsService, RelationalMarketCommentPersistenceModule],
})
export class MarketCommentsModule {}
