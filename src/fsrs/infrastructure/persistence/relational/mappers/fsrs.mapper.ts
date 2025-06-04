import { Fsrs } from '../../../../domain/fsrs';
import { FsrsEntity } from '../entities/fsrs.entity';

export class FsrsMapper {
  static toDomain(raw: FsrsEntity): Fsrs {
    const domainEntity = new Fsrs();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Fsrs): FsrsEntity {
    const persistenceEntity = new FsrsEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
