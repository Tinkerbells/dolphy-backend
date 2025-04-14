import { Revlog } from 'src/schedulers/domain/revlog';
import { NullableType } from 'src/utils/types/nullable.type';
import { State } from 'ts-fsrs';

export abstract class RevlogRepository {
  abstract create(data: Omit<Revlog, 'id'>): Promise<Revlog>;

  abstract findById(
    id: Revlog['id'],
    uid: number,
  ): Promise<NullableType<Revlog>>;

  abstract findByCardId(cardId: number, uid: number): Promise<Revlog[]>;

  abstract markAsDeleted(id: Revlog['id'], uid: number): Promise<boolean>;

  abstract getRangeRevlogCount(
    uid: number,
    range: [number, number],
    states: State[] | null,
    dids: number[] | null,
  ): Promise<Map<State, number>>;

  abstract exportLogs(
    uid: number,
    timeRange?: [number, number],
  ): Promise<any[]>;
}
