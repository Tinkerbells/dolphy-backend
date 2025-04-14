import { Deck } from 'src/decks/domain/deck';
import { DeepPartial } from 'src/utils/types/deep-partial.type';
import { NullableType } from 'src/utils/types/nullable.type';

export abstract class DeckRepository {
  abstract create(
    data: Omit<Deck, 'id' | 'created' | 'updated'>,
  ): Promise<Deck>;

  abstract findById(id: Deck['id'], uid: number): Promise<NullableType<Deck>>;

  abstract findAll(uid: number, deleted?: boolean): Promise<Deck[]>;

  abstract update(
    id: Deck['id'],
    data: DeepPartial<Deck>,
    uid: number,
  ): Promise<NullableType<Deck>>;

  abstract softDelete(id: Deck['id'], uid: number): Promise<boolean>;

  abstract getDefaultDeck(uid: number): Promise<number>;
}
