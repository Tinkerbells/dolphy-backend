import {
  // common
  Module,
} from '@nestjs/common';
import { DecksService } from './decks.service';
import { DecksController } from './decks.controller';
import { RelationalDecksPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalDecksPersistenceModule,
  ],
  controllers: [DecksController],
  providers: [DecksService],
  exports: [DecksService, RelationalDecksPersistenceModule],
})
export class DecksModule {}
