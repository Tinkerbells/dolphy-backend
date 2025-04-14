import { Injectable } from '@nestjs/common';
import { NoteRepository } from './infrastructure/persistence/note.repository';
import { Note } from './domain/note';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { NullableType } from '../utils/types/nullable.type';
import { SchedulersService } from 'src/schedulers/schedulers.service';

@Injectable()
export class NotesService {
  constructor(
    private readonly noteRepository: NoteRepository,
    private readonly schedulerService: SchedulersService,
  ) {}

  async findAll(
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
  }> {
    return this.noteRepository.findAll(uid, options);
  }

  async findById(id: number, uid: number): Promise<NullableType<Note>> {
    return this.noteRepository.findById(id, uid);
  }

  async create(uid: number, did: number, dto: CreateNoteDto): Promise<number> {
    const now = Date.now();

    // Транзакция: создаем заметку и карточку
    const note = await this.noteRepository.create({
      uid,
      did,
      question: dto.question,
      answer: dto.answer,
      source: dto.source || '',
      sourceId: dto.sourceId,
      extend: dto.extend || {},
      deleted: false,
    });

    // Создаем карточку
    await this.schedulerService.createCard(uid, did, note.id, now);

    return note.id;
  }

  async update(id: number, uid: number, dto: UpdateNoteDto): Promise<boolean> {
    // Создаем объект с обновленными данными
    const updateData: DeepPartial<Note> = {};

    if (dto.question !== undefined) updateData.question = dto.question;
    if (dto.answer !== undefined) updateData.answer = dto.answer;
    if (dto.source !== undefined) updateData.source = dto.source;
    if (dto.sourceId !== undefined) updateData.sourceId = dto.sourceId;
    if (dto.extend !== undefined) updateData.extend = dto.extend;

    return this.noteRepository.update(id, updateData, uid);
  }

  async switchDelete(
    ids: number[],
    deleted: boolean,
    uid: number,
  ): Promise<void> {
    await this.noteRepository.switchDelete(ids, deleted, uid);
  }
}
