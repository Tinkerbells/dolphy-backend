import { Module } from '@nestjs/common';
import { MarketCommentRepository } from '../market-comment.repository';
import { MarketCommentRelationalRepository } from './repositories/market-comment.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketCommentEntity } from './entities/market-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarketCommentEntity])],
  providers: [
    {
      provide: MarketCommentRepository,
      useClass: MarketCommentRelationalRepository,
    },
  ],
  exports: [MarketCommentRepository],
})
export class RelationalMarketCommentPersistenceModule {}
