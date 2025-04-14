import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevlogEntity } from '../entities/revlog.entity';
import { RevlogRepository } from '../../revlog.repository';
import { RevlogMapper } from '../mappers/revlog.mapper';
import { Revlog } from '../../../../domain/revlog';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { State } from 'ts-fsrs';

@Injectable()
export class RevlogRelationalRepository implements RevlogRepository {
  constructor(
    @InjectRepository(RevlogEntity)
    private readonly revlogRepository: Repository<RevlogEntity>,
  ) {}

  async create(data: Omit<Revlog, 'id'>): Promise<Revlog> {
    const entity = this.revlogRepository.create(data);
    const savedEntity = await this.revlogRepository.save(entity);
    return RevlogMapper.toDomain(savedEntity);
  }

  async findById(id: Revlog['id'], uid: number): Promise<NullableType<Revlog>> {
    const entity = await this.revlogRepository.findOne({
      where: { id, uid },
    });

    return entity ? RevlogMapper.toDomain(entity) : null;
  }

  async findByCardId(cardId: number, uid: number): Promise<Revlog[]> {
    const entities = await this.revlogRepository.find({
      where: { cid: cardId, uid, deleted: false },
      order: { review: 'DESC' },
    });

    return entities.map((entity) => RevlogMapper.toDomain(entity));
  }

  async markAsDeleted(id: Revlog['id'], uid: number): Promise<boolean> {
    const result = await this.revlogRepository.update(
      { id, uid },
      { deleted: true },
    );

    if (!result) {
      throw new NotFoundException(`Revlog with ${id} not found`);
    }

    return true;
  }

  async getRangeRevlogCount(
    uid: number,
    range: [number, number],
    states: State[] | null,
    dids: number[] | null,
  ): Promise<Map<State, number>> {
    const query = this.revlogRepository
      .createQueryBuilder('revlog')
      .select('revlog.state')
      .addSelect('COUNT(revlog.id)', 'count')
      .where('revlog.uid = :uid', { uid })
      .andWhere('revlog.deleted = :deleted', { deleted: false })
      .andWhere('revlog.review >= :start', { start: range[0] })
      .andWhere('revlog.review < :end', { end: range[1] });

    if (states && states.length > 0) {
      query.andWhere('revlog.state IN (:...states)', { states });
    }

    if (dids && dids.length > 0) {
      query.andWhere('revlog.did IN (:...dids)', { dids });
    }

    query.groupBy('revlog.state');

    const results = await query.getRawMany();

    const map = new Map<State, number>();
    const allStates = [
      State.New,
      State.Learning,
      State.Relearning,
      State.Review,
    ];

    // Инициализируем все состояния нулями
    for (const state of allStates) {
      map.set(state, 0);
    }

    // Заполняем результатами из запроса
    for (const result of results) {
      map.set(Number(result.revlog_state), Number(result.count));
    }

    return map;
  }

  async exportLogs(uid: number, timeRange?: [number, number]): Promise<any[]> {
    const query = this.revlogRepository
      .createQueryBuilder('r')
      .select([
        'r.cid as card_id',
        'r.review as review_time',
        'r.grade as review_rating',
        'r.state as review_state',
        'r.duration as review_duration',
      ])
      .where('r.uid = :uid', { uid })
      .andWhere('r.deleted = :deleted', { deleted: false });

    if (timeRange) {
      query
        .andWhere('r.review >= :start', { start: timeRange[0] })
        .andWhere('r.review < :end', { end: timeRange[1] });
    }

    return query.getRawMany();
  }
}
