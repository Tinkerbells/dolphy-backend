import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteEntity } from '../entities/note.entity';
import { NoteRepository } from '../../note.repository';
import { NoteMapper } from '../mappers/note.mapper';
import { Note } from '../../../../domain/note';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { CardEntity } from '../../../../../cards/infrastructure/persistence/relational/entities/card.entity';

@Injectable()
export class NoteRelationalRepository implements NoteRepository {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepository: Repository<NoteEntity>,
  ) {}

  async create(
    data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Note> {
    const entity = this.noteRepository.create({
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const savedEntity = await this.noteRepository.save(entity);
    return NoteMapper.toDomain(savedEntity);
  }

  async findById(id: Note['id'], uid: number): Promise<NullableType<Note>> {
    const entity = await this.noteRepository.findOne({
      where: { id, uid },
    });

    return entity ? NoteMapper.toDomain(entity) : null;
  }

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
    const query = this.noteRepository
      .createQueryBuilder('note')
      .where('note.uid = :uid', { uid });

    if (options.did) {
      query.andWhere('note.did = :did', { did: options.did });
    }

    if (options.keyword) {
      query.andWhere(
        '(note.question ILIKE :keyword OR note.answer ILIKE :keyword)',
        { keyword: `%${options.keyword}%` },
      );
    }

    if (typeof options.deleted === 'boolean') {
      query.andWhere('note.deleted = :deleted', { deleted: options.deleted });
    }

    const total = await query.getCount();

    const entities = await query
      .skip((options.page - 1) * options.pageSize)
      .take(options.pageSize)
      .orderBy('note.id', 'DESC')
      .getMany();

    return {
      data: entities.map((entity) => NoteMapper.toDomain(entity)),
      pagination: {
        page: options.page,
        pageSize: options.pageSize,
        total,
      },
    };
  }

  async update(
    id: Note['id'],
    data: DeepPartial<Note>,
    uid: number,
  ): Promise<boolean> {
    const result = await this.noteRepository.update(
      { id, uid },
      {
        ...data,
        updatedAt: Date.now(),
      },
    );

    if (!result) {
      throw new NotFoundException(`Note with ${id} not found`);
    }

    return true;
  }

  async switchDelete(
    ids: Note['id'][],
    deleted: boolean,
    uid: number,
  ): Promise<void> {
    await this.noteRepository.manager.transaction(async (manager) => {
      // Обновляем заметки
      await manager.update(NoteEntity, { id: { $in: ids }, uid }, { deleted });

      // Обновляем связанные карточки
      await manager.update(CardEntity, { nid: { $in: ids }, uid }, { deleted });

      // Обновляем связанные логи
      await manager.update('revlog', { nid: { $in: ids }, uid }, { deleted });
    });
  }
}
