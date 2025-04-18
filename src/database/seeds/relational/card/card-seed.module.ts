import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CardSeedService } from './card-seed.service';
import { CardEntity } from '../../../../cards/infrastructure/persistence/relational/entities/card.entity';
import { DeckEntity } from '../../../../decks/infrastructure/persistence/relational/entities/deck.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CardEntity, DeckEntity])],
  providers: [CardSeedService],
  exports: [CardSeedService],
})
export class CardSeedModule {}
