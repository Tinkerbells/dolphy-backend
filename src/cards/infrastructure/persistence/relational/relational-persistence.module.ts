import { Module } from '@nestjs/common';
import { CardRepository } from '../card.repository';
import { CardContentRepository } from '../card-content.repository';
import { CardRelationalRepository } from './repositories/card.repository';
import { CardContentRelationalRepository } from './repositories/card-content.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from './entities/card.entity';
import { CardContentEntity } from './entities/card-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CardEntity, CardContentEntity])],
  providers: [
    {
      provide: CardRepository,
      useClass: CardRelationalRepository,
    },
    {
      provide: CardContentRepository,
      useClass: CardContentRelationalRepository,
    },
  ],
  exports: [CardRepository, CardContentRepository],
})
export class RelationalCardPersistenceModule {}
