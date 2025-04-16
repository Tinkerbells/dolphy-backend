import { Module } from '@nestjs/common';
import { DeckRepository } from '../deck.repository';
import { DeckRelationalRepository } from './repositories/deck.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
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
export class RelationalDeckPersistenceModule {}
