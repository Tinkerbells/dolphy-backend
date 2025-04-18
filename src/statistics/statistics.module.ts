import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { DecksModule } from '../decks/decks.module';
import { CardsModule } from '../cards/cards.module';
import { ReviewLogsModule } from '../review-logs/review-logs.module';

@Module({
  imports: [DecksModule, CardsModule, ReviewLogsModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
