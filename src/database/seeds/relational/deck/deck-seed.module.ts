import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeckSeedService } from './deck-seed.service';
import { DeckEntity } from '../../../../decks/infrastructure/persistence/relational/entities/deck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeckEntity])],
  providers: [DeckSeedService],
  exports: [DeckSeedService],
})
export class DeckSeedModule {}

