import { Note } from '../../../../domain/note';
import { NoteEntity } from '../entities/note.entity';

export class NoteMapper {
  static toDomain(raw: NoteEntity): Note {
    const domainEntity = new Note();
    domainEntity.id = raw.id;
    domainEntity.cardId = raw.cardId;
    domainEntity.question = raw.question;
    domainEntity.answer = raw.answer;
    domainEntity.extend = raw.extend;
    domainEntity.deleted = raw.deleted;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Note): NoteEntity {
    const persistenceEntity = new NoteEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.cardId = domainEntity.cardId;
    persistenceEntity.question = domainEntity.question;
    persistenceEntity.answer = domainEntity.answer;
    persistenceEntity.extend = domainEntity.extend;
    persistenceEntity.deleted = domainEntity.deleted;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
