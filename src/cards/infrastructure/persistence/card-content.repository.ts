import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { CardContent } from '../../domain/card-content';

export abstract class CardContentRepository {
  abstract create(
    data: Omit<CardContent, 'id' | 'createdAt'>,
  ): Promise<CardContent>;

  abstract findById(id: CardContent['id']): Promise<NullableType<CardContent>>;

  abstract findByCardId(cardId: string): Promise<NullableType<CardContent>>;

  abstract findBySourceId(sourceId: string): Promise<CardContent[]>;

  abstract update(
    id: CardContent['id'],
    payload: DeepPartial<CardContent>,
  ): Promise<CardContent | null>;

  abstract updateByCardId(
    cardId: string,
    payload: DeepPartial<CardContent>,
  ): Promise<CardContent | null>;

  abstract remove(id: CardContent['id']): Promise<void>;
}
