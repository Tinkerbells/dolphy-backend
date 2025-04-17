import { Module } from '@nestjs/common';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';
import { RelationalDeckPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalDeckPersistenceModule],
  controllers: [DecksController],
  providers: [DecksService],
  exports: [DecksService, RelationalDeckPersistenceModule],
})
export class DecksModule {}
