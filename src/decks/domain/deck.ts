import { CardLimits } from 'src/fsrs/domain/card-limits';
import { FSRSParameters } from 'src/fsrs/domain/fsrs-parameters';

export class Deck {
  id: number;
  name: string;
  description?: string;
  fsrs: FSRSParameters;
  card_limit: CardLimits;
  deleted: boolean;
  uid: number;
  createdAt: number;
  updatedAt: number;
}
