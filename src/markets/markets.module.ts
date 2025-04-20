import {
  // common
  Module,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { RelationalMarketPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalMarketPersistenceModule,
  ],
  controllers: [MarketsController],
  providers: [MarketsService],
  exports: [MarketsService, RelationalMarketPersistenceModule],
})
export class MarketsModule {}
