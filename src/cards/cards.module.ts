import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { RelationalCardPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FsrsModule } from '../fsrs/fsrs.module';
import { NotesModule } from 'src/notes/notes.module';

@Module({
  imports: [RelationalCardPersistenceModule, FsrsModule, NotesModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService, RelationalCardPersistenceModule],
})
export class CardsModule {}
