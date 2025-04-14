import { Module } from '@nestjs/common';
import { CardsRepository } from '../card.repository';
import { CardsRelationalRepository } from './repositories/card.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsEntity } from './entities/card.entity';

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
