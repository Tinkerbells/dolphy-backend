import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NoteEntity } from '../entities/note.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Note } from '../../../../domain/note';
import { NoteRepository } from '../../note.repository';
import { NoteMapper } from '../mappers/note.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class NoteRelationalRepository implements NoteRepository {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepository: Repository<NoteEntity>,
  ) {}

  async create(data: Note): Promise<Note> {
    const persistenceModel = NoteMapper.toPersistence(data);
    const newEntity = await this.noteRepository.save(
      this.noteRepository.create(persistenceModel),
    );
    return NoteMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Note[]> {
    const entities = await this.noteRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => NoteMapper.toDomain(entity));
  }

  async findById(id: Note['id']): Promise<NullableType<Note>> {
    const entity = await this.noteRepository.findOne({
      where: { id },
    });

    return entity ? NoteMapper.toDomain(entity) : null;
  }

  async findByIds(ids: Note['id'][]): Promise<Note[]> {
    const entities = await this.noteRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => NoteMapper.toDomain(entity));
  }

  async update(id: Note['id'], payload: Partial<Note>): Promise<Note> {
    const entity = await this.noteRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.noteRepository.save(
      this.noteRepository.create(
        NoteMapper.toPersistence({
          ...NoteMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return NoteMapper.toDomain(updatedEntity);
  }

  async remove(id: Note['id']): Promise<void> {
    await this.noteRepository.delete(id);
  }
}
