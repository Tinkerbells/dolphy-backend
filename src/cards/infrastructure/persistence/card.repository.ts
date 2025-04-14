import { Card } from 'src/cards/domain/card';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';

export abstract class CardRepository {
  abstract create(
    data: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Card>;

  abstract findById(id: Card['id'], uid: number): Promise<NullableType<Card>>;

  abstract findByIds(ids: Card['id'][], uid: number): Promise<Card[]>;

  abstract update(
    id: Card['id'],
    data: DeepPartial<Card>,
    uid: number,
  ): Promise<NullableType<Card>>;

  abstract bulkUpdate(
    ids: Card['id'][],
    data: DeepPartial<Card>,
    uid: number,
  ): Promise<number>;

  abstract findByDeckId(deckId: number, uid: number): Promise<Card[]>;

  abstract findByNoteId(noteId: number, uid: number): Promise<Card[]>;

  abstract findDueCards(
    uid: number,
    timestamp: number,
    limit: number,
  ): Promise<Card[]>;
}
