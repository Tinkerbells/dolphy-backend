import {
  // common
  Module,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { RelationalCardPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalCardPersistenceModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, RelationalCardPersistenceModule],
})
export class CardsModule {}
