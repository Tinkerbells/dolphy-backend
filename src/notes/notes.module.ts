import {
  // common
  Module,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { RelationalNotePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalNotePersistenceModule,
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService, RelationalNotePersistenceModule],
})
export class NotesModule {}
