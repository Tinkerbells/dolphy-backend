import { State, Grade } from 'ts-fsrs';

export class Revlog {
  id: number;
  grade: Grade;
  state: State;
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  last_elapsed_days: number;
  scheduled_days: number;
  review: number;
  duration: number;
  offset: number;
  deleted: boolean;
  cid: number;
  nid: number;
  did: number;
  uid: number;
}
