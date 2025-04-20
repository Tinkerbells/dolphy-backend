import { Module } from '@nestjs/common';
import { MarketDeckRepository } from '../market-deck.repository';
import { MarketDeckRelationalRepository } from './repositories/market-deck.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDeckEntity } from './entities/market-deck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarketDeckEntity])],
  providers: [
    {
      provide: MarketDeckRepository,
      useClass: MarketDeckRelationalRepository,
    },
  ],
  exports: [MarketDeckRepository],
})
export class RelationalMarketDeckPersistenceModule {}
