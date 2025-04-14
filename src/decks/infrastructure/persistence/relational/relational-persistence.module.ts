import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeckRepository } from '../deck.repository';
import { DeckRelationalRepository } from './repositories/deck.repository';
import { DeckEntity } from './entities/deck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeckEntity])],
  providers: [
    {
      provide: DeckRepository,
      useClass: DeckRelationalRepository,
    },
  ],
  exports: [DeckRepository],
})
export class RelationalDecksPersistenceModule {}
