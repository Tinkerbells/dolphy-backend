import { Module } from '@nestjs/common';
import { StudySessionRepository } from '../study-session.repository';
import { StudySessionRelationalRepository } from './repositories/study-session.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySessionEntity } from './entities/study-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudySessionEntity])],
  providers: [
    {
      provide: StudySessionRepository,
      useClass: StudySessionRelationalRepository,
    },
  ],
  exports: [StudySessionRepository],
})
export class RelationalStudySessionPersistenceModule {}
