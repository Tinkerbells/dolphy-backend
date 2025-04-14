export class Note {
  id: number;
  question: string;
  answer: string;
  source: string;
  sourceId?: string;
  extend: Record<string, any>;
  deleted: boolean;
  did: number;
  uid: number;
  createdAt: number;
  updatedAt: number;
}
