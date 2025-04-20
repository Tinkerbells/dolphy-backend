import { Module } from '@nestjs/common';
import { MarketRepository } from '../market.repository';
import { MarketRelationalRepository } from './repositories/market.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketEntity } from './entities/market.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarketEntity])],
  providers: [
    {
      provide: MarketRepository,
      useClass: MarketRelationalRepository,
    },
  ],
  exports: [MarketRepository],
})
export class RelationalMarketPersistenceModule {}
