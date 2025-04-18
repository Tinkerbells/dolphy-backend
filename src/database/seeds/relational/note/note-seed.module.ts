import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NoteSeedService } from './note-seed.service';
import { NoteEntity } from '../../../../notes/infrastructure/persistence/relational/entities/note.entity';
import { CardEntity } from '../../../../cards/infrastructure/persistence/relational/entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoteEntity, CardEntity])],
  providers: [NoteSeedService],
  exports: [NoteSeedService],
})
export class NoteSeedModule {}
