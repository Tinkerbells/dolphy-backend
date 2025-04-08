import {
  // common
  Module,
} from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service';
import { StudySessionsController } from './study-sessions.controller';
import { RelationalStudySessionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalStudySessionPersistenceModule,
  ],
  controllers: [StudySessionsController],
  providers: [StudySessionsService],
  exports: [StudySessionsService, RelationalStudySessionPersistenceModule],
})
export class StudySessionsModule {}
