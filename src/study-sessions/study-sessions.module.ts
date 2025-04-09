import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySessionsService } from './study-sessions.service';
import { StudySessionsController } from './study-sessions.controller';
import { RelationalStudySessionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { StudySessionEntity } from './infrastructure/persistence/relational/entities/study-session.entity';
import { StudySessionCardEntity } from './infrastructure/persistence/relational/entities/study-session-card.entity';
import { CardsModule } from '../cards/cards.module';
import { DecksModule } from '../decks/decks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudySessionEntity, StudySessionCardEntity]),
    RelationalStudySessionPersistenceModule,
    CardsModule, // Импортируем модуль карточек
    DecksModule, // Импортируем модуль колод
  ],
  controllers: [StudySessionsController],
  providers: [StudySessionsService],
  exports: [StudySessionsService, RelationalStudySessionPersistenceModule],
})
export class StudySessionsModule {}
