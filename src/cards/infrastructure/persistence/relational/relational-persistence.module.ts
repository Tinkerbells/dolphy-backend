import { Module } from '@nestjs/common';
import { CardRepository } from '../card.repository';
import { CardRelationalRepository } from './repositories/card.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from './entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CardEntity])],
  providers: [
    {
      provide: CardRepository,
      useClass: CardRelationalRepository,
    },
  ],
  exports: [CardRepository],
})
export class RelationalCardPersistenceModule {}
