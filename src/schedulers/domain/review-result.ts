import { State } from 'ts-fsrs';

export type ReviewResult = {
  nextState: State;
  nextDue: Date;
  suspended: boolean;
  uid: number;
  did: number;
  nid: number;
  cid: number;
  lid?: number;
};
