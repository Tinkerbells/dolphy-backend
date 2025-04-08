import { Module } from '@nestjs/common';
import { CardsRepository } from '../cards.repository';
import { CardsRelationalRepository } from './repositories/cards.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsEntity } from './entities/cards.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CardsEntity])],
  providers: [
    {
      provide: CardsRepository,
      useClass: CardsRelationalRepository,
    },
  ],
  exports: [CardsRepository],
})
export class RelationalCardsPersistenceModule {}
