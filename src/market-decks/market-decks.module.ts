import {
  // common
  Module,
} from '@nestjs/common';
import { MarketDecksService } from './market-decks.service';
import { MarketDecksController } from './market-decks.controller';
import { RelationalMarketDeckPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalMarketDeckPersistenceModule,
  ],
  controllers: [MarketDecksController],
  providers: [MarketDecksService],
  exports: [MarketDecksService, RelationalMarketDeckPersistenceModule],
})
export class MarketDecksModule {}
