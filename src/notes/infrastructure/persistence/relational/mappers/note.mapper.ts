import { Note } from '../../../../domain/note';
import { NoteEntity } from '../entities/note.entity';

export class NoteMapper {
  static toDomain(raw: NoteEntity): Note {
    const domainEntity = new Note();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Note): NoteEntity {
    const persistenceEntity = new NoteEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
