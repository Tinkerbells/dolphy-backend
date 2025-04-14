import { Note } from 'src/notes/domain/note';
import { DeepPartial } from 'src/utils/types/deep-partial.type';
import { NullableType } from 'src/utils/types/nullable.type';

export abstract class NoteRepository {
  abstract create(
    data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Note>;

  abstract findById(id: Note['id'], uid: number): Promise<NullableType<Note>>;

  abstract findAll(
    uid: number,
    options: {
      did?: number;
      keyword?: string;
      deleted?: boolean;
      page: number;
      pageSize: number;
    },
  ): Promise<{
    data: Note[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
    };
  }>;

  abstract update(
    id: Note['id'],
    data: DeepPartial<Note>,
    uid: number,
  ): Promise<boolean>;

  abstract switchDelete(
    ids: Note['id'][],
    deleted: boolean,
    uid: number,
  ): Promise<void>;
}
