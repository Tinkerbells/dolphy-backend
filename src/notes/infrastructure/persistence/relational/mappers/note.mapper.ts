import { Note } from '../../../../domain/note';
import { NoteEntity } from '../entities/note.entity';

export class NoteMapper {
  static toDomain(entity: NoteEntity): Note {
    const note = new Note();

    note.id = entity.id;
    note.question = entity.question;
    note.answer = entity.answer;
    note.source = entity.source;
    note.sourceId = entity.sourceId;
    note.extend = entity.extend;
    note.deleted = entity.deleted;
    note.did = entity.did;
    note.uid = entity.uid;
    note.createdAt = +entity.createdAt;
    note.updatedAt = +entity.updatedAt;

    return note;
  }

  static toPersistence(domain: Note): NoteEntity {
    const entity = new NoteEntity();

    entity.id = domain.id;
    entity.question = domain.question;
    entity.answer = domain.answer;
    entity.source = domain.source;
    entity.sourceId = domain.sourceId;
    entity.extend = domain.extend;
    entity.deleted = domain.deleted;
    entity.did = domain.did;
    entity.uid = domain.uid;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }
}
