import { Revlog } from 'src/schedulers/domain/revlog';
import { RevlogEntity } from '../entities/revlog.entity';

export class RevlogMapper {
  static toDomain(entity: RevlogEntity): Revlog {
    const revlog = new Revlog();

    revlog.id = entity.id;
    revlog.grade = entity.grade;
    revlog.state = entity.state;
    revlog.due = entity.due;
    revlog.stability = entity.stability;
    revlog.difficulty = entity.difficulty;
    revlog.elapsed_days = entity.elapsed_days;
    revlog.last_elapsed_days = entity.last_elapsed_days;
    revlog.scheduled_days = entity.scheduled_days;
    revlog.review = entity.review;
    revlog.duration = entity.duration;
    revlog.offset = entity.offset;
    revlog.deleted = entity.deleted;
    revlog.cid = entity.cid;
    revlog.nid = entity.nid;
    revlog.did = entity.did;
    revlog.uid = entity.uid;

    return revlog;
  }

  static toPersistence(domain: Revlog): RevlogEntity {
    const entity = new RevlogEntity();

    entity.id = domain.id;
    entity.grade = domain.grade;
    entity.state = domain.state;
    entity.due = domain.due;
    entity.stability = domain.stability;
    entity.difficulty = domain.difficulty;
    entity.elapsed_days = domain.elapsed_days;
    entity.last_elapsed_days = domain.last_elapsed_days;
    entity.scheduled_days = domain.scheduled_days;
    entity.review = domain.review;
    entity.duration = domain.duration;
    entity.offset = domain.offset;
    entity.deleted = domain.deleted;
    entity.cid = domain.cid;
    entity.nid = domain.nid;
    entity.did = domain.did;
    entity.uid = domain.uid;

    return entity;
  }
}
