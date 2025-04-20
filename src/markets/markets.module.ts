import { Module } from '@nestjs/common';
import { RelationalMarketPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { MarketDecksController } from './market-decks.controller';
import { MarketCommentsController } from './market-comments.controller';
import { MarketDecksService } from './market-decks.service';
import { MarketCommentsService } from './market-comments.service';
import { DecksModule } from '../decks/decks.module';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [RelationalMarketPersistenceModule, DecksModule, CardsModule],
  controllers: [MarketDecksController, MarketCommentsController],
  providers: [MarketDecksService, MarketCommentsService],
  exports: [
    MarketDecksService,
    MarketCommentsService,
    RelationalMarketPersistenceModule,
  ],
})
export class MarketsModule {}
