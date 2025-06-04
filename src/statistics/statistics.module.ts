import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { DecksModule } from '../decks/decks.module';
import { CardsModule } from '../cards/cards.module';
import { FsrsModule } from '../fsrs/fsrs.module';

@Module({
  imports: [DecksModule, CardsModule, FsrsModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
