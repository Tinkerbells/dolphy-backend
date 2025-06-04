import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from '../../../../cards/infrastructure/persistence/relational/entities/card.entity';
import { DeckEntity } from '../../../../decks/infrastructure/persistence/relational/entities/deck.entity';
import { FsrsCardEntity } from '../../../../fsrs/infrastructure/persistence/relational/entities/fsrs-card.entity';
import { CardSeedService } from './card-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([CardEntity, DeckEntity, FsrsCardEntity])],
  providers: [CardSeedService],
  exports: [CardSeedService],
})
export class CardSeedModule {}
