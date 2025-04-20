import {
  // common
  Module,
} from '@nestjs/common';
import { MarketDecksService } from './market-decks.service';
import { MarketDecksController } from './market-decks.controller';
import { RelationalMarketDeckPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { DecksModule } from 'src/decks/decks.module';
import { CardsModule } from 'src/cards/cards.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalMarketDeckPersistenceModule,
    DecksModule,
    CardsModule,
  ],
  controllers: [MarketDecksController],
  providers: [MarketDecksService],
  exports: [MarketDecksService, RelationalMarketDeckPersistenceModule],
})
export class MarketDecksModule {}
