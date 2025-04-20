import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDeckEntity } from './entities/market-deck.entity';
import { MarketCommentEntity } from './entities/market-comment.entity';
import { MarketDeckRepository } from '../market-deck.repository';
import { MarketCommentRepository } from '../market-comment.repository';
import { MarketDeckRelationalRepository } from './repositories/market-deck.repository';
import { MarketCommentRelationalRepository } from './repositories/market-comment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MarketDeckEntity, MarketCommentEntity])],
  providers: [
    {
      provide: MarketDeckRepository,
      useClass: MarketDeckRelationalRepository,
    },
    {
      provide: MarketCommentRepository,
      useClass: MarketCommentRelationalRepository,
    },
  ],
  exports: [MarketDeckRepository, MarketCommentRepository],
})
export class RelationalMarketPersistenceModule {}
