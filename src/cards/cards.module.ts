import {
  // common
  Module,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { RelationalCardsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalCardsPersistenceModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, RelationalCardsPersistenceModule],
})
export class CardsModule {}
