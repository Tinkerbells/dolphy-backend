import { State } from 'ts-fsrs';

export class Card {
  id: number;
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: State;
  last_review: number | null;
  suspended: boolean;
  deleted: boolean;
  nid: number;
  did: number;
  uid: number;
  createdAt: number;
  updatedAt: number;
}
