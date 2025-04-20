import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { MarketDeck } from '../../domain/market-deck';
import { MarketDeckSortField } from '../../dto/find-all-market-decks.dto';

export abstract class MarketDeckRepository {
  abstract create(
    data: Omit<MarketDeck, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<MarketDeck>;

  abstract findAllWithPagination({
    paginationOptions,
    authorId,
    searchQuery,
    tags,
    sortBy,
    sortDirection,
  }: {
    paginationOptions: IPaginationOptions;
    authorId?: string;
    searchQuery?: string;
    tags?: string[];
    sortBy?: MarketDeckSortField;
    sortDirection?: 'ASC' | 'DESC';
  }): Promise<MarketDeck[]>;

  abstract findPopular({
    paginationOptions,
    sortBy,
  }: {
    paginationOptions: IPaginationOptions;
    sortBy?: 'downloadCount' | 'rating';
  }): Promise<MarketDeck[]>;

  abstract findById(id: MarketDeck['id']): Promise<NullableType<MarketDeck>>;

  abstract findByDeckId(deckId: string): Promise<NullableType<MarketDeck>>;

  abstract findByIds(ids: MarketDeck['id'][]): Promise<MarketDeck[]>;

  abstract update(
    id: MarketDeck['id'],
    payload: DeepPartial<MarketDeck>,
  ): Promise<MarketDeck | null>;

  abstract incrementDownloadCount(
    id: MarketDeck['id'],
  ): Promise<MarketDeck | null>;

  abstract updateRating(
    id: MarketDeck['id'],
    newRating: number,
    commentCount: number,
  ): Promise<MarketDeck | null>;

  abstract remove(id: MarketDeck['id']): Promise<void>;
}
