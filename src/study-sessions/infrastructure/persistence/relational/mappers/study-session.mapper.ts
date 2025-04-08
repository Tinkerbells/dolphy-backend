import { StudySession } from '../../../../domain/study-session';
import { StudySessionEntity } from '../entities/study-session.entity';

export class StudySessionMapper {
  static toDomain(raw: StudySessionEntity): StudySession {
    const domainEntity = new StudySession();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: StudySession): StudySessionEntity {
    const persistenceEntity = new StudySessionEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
