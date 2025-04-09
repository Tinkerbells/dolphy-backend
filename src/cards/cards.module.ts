import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { RelationalCardsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { DecksModule } from 'src/decks/decks.module';

@Module({
  imports: [RelationalCardsPersistenceModule, DecksModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, RelationalCardsPersistenceModule],
})
export class CardsModule {}
