import { Module } from '@nestjs/common';
import { NoteRepository } from '../note.repository';
import { NoteRelationalRepository } from './repositories/note.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteEntity } from './entities/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NoteEntity])],
  providers: [
    {
      provide: NoteRepository,
      useClass: NoteRelationalRepository,
    },
  ],
  exports: [NoteRepository],
})
export class RelationalNotePersistenceModule {}
