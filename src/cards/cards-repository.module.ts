import { Module } from '@nestjs/common';
import { RelationalCardPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalCardPersistenceModule],
  exports: [RelationalCardPersistenceModule],
})
export class CardsRepositoryModule {}
