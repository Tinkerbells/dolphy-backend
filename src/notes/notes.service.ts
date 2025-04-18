import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteRepository } from './infrastructure/persistence/note.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Note } from './domain/note';

@Injectable()
export class NotesService {
  constructor(
    // Dependencies here
    private readonly noteRepository: NoteRepository,
  ) {}

  async create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createNoteDto: CreateNoteDto,
  ) {
    // Do not remove comment below.
    // <creating-property />

    return this.noteRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.noteRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Note['id']) {
    return this.noteRepository.findById(id);
  }

  findByIds(ids: Note['id'][]) {
    return this.noteRepository.findByIds(ids);
  }

  async update(
    id: Note['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateNoteDto: UpdateNoteDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.noteRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Note['id']) {
    return this.noteRepository.remove(id);
  }
}
