import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySessionRepository } from '../study-session.repository';
import { StudySessionRelationalRepository } from './repositories/study-session.repository';
import { StudySessionEntity } from './entities/study-session.entity';
import { StudySessionCardEntity } from './entities/study-session-card.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudySessionEntity, StudySessionCardEntity]),
  ],
  providers: [
    {
      provide: StudySessionRepository,
      useClass: StudySessionRelationalRepository,
    },
  ],
  exports: [StudySessionRepository],
})
export class RelationalStudySessionPersistenceModule {}
