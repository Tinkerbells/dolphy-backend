import { Injectable } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteRepository } from './infrastructure/persistence/note.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Note } from './domain/note';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotesService {
  constructor(private readonly noteRepository: NoteRepository) {}

  async create(createNoteDto: CreateNoteDto): Promise<Note> {
    const newNote = new Note();
    newNote.id = uuidv4();
    newNote.cardId = createNoteDto.cardId;
    newNote.question = createNoteDto.question;
    newNote.answer = createNoteDto.answer;
    newNote.deleted = false;

    // Если есть метаданные, добавляем их
    if (createNoteDto.metadata) {
      newNote.extend = createNoteDto.metadata;
    } else {
      newNote.source = 'manual';
    }

    return this.noteRepository.create(newNote);
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Note[]> {
    return this.noteRepository.findAllWithPagination({
      paginationOptions,
    });
  }

  findById(id: Note['id']): Promise<Note | null> {
    return this.noteRepository.findById(id);
  }

  findByIds(ids: Note['id'][]): Promise<Note[]> {
    return this.noteRepository.findByIds(ids);
  }

  findByCardId(cardId: string): Promise<Note | null> {
    return this.noteRepository.findByCardId(cardId);
  }

  /**
   * Получить все заметки по ID колоды
   * @param deckId Идентификатор колоды
   * @returns Массив заметок, связанных с карточками указанной колоды
   */
  findByDeckId(deckId: string): Promise<Note[]> {
    return this.noteRepository.findByDeckId(deckId);
  }

  /**
   * Получить заметки по ID колоды с пагинацией
   * @param deckId Идентификатор колоды
   * @param paginationOptions Параметры пагинации
   * @returns Массив заметок с учетом пагинации
   */
  findByDeckIdWithPagination({
    deckId,
    paginationOptions,
  }: {
    deckId: string;
    paginationOptions: IPaginationOptions;
  }): Promise<Note[]> {
    return this.noteRepository.findByDeckIdWithPagination({
      deckId,
      paginationOptions,
    });
  }

  async update(
    id: Note['id'],
    updateNoteDto: UpdateNoteDto,
  ): Promise<Note | null> {
    const updateData: Partial<Note> = {};

    if (updateNoteDto.question !== undefined) {
      updateData.question = updateNoteDto.question;
    }

    if (updateNoteDto.answer !== undefined) {
      updateData.answer = updateNoteDto.answer;
    }

    // Если есть метаданные, обновляем их
    if (updateNoteDto.metadata) {
      updateData.extend = updateNoteDto.metadata;
    }

    return this.noteRepository.update(id, updateData);
  }

  async updateByCardId(
    cardId: string,
    updateNoteDto: UpdateNoteDto,
  ): Promise<Note | null> {
    const updateData: Partial<Note> = {};

    if (updateNoteDto.question !== undefined) {
      updateData.question = updateNoteDto.question;
    }

    if (updateNoteDto.answer !== undefined) {
      updateData.answer = updateNoteDto.answer;
    }

    // Если есть метаданные, обновляем их
    if (updateNoteDto.metadata) {
      updateData.extend = updateNoteDto.metadata;
    }

    return this.noteRepository.updateByCardId(cardId, updateData);
  }

  async softDelete(id: Note['id']): Promise<void> {
    await this.noteRepository.update(id, { deleted: true });
  }

  remove(id: Note['id']): Promise<void> {
    return this.noteRepository.remove(id);
  }
}
