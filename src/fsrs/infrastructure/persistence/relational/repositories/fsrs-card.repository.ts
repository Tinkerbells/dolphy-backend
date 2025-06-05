import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, SelectQueryBuilder } from 'typeorm';
import { FsrsCardEntity } from '../entities/fsrs-card.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import {
  FsrsCard,
  FsrsCardWithContent,
  State,
} from '../../../../domain/fsrs-card';
import { FsrsCardRepository } from '../../fsrs-card.repository';
import { FsrsCardMapper } from '../mappers/fsrs-card.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class FsrsCardRelationalRepository implements FsrsCardRepository {
  constructor(
    @InjectRepository(FsrsCardEntity)
    private readonly fsrsCardRepository: Repository<FsrsCardEntity>,
  ) {}

  /**
   * Создает базовый QueryBuilder с общими условиями
   */
  private createBaseQueryBuilder(
    alias = 'fsrs_card',
    includeCard = false,
  ): SelectQueryBuilder<FsrsCardEntity> {
    let qb = this.fsrsCardRepository
      .createQueryBuilder(alias)
      .where(`${alias}.deleted = :deleted`, { deleted: false });

    if (includeCard) {
      qb = qb
        .leftJoinAndSelect(`${alias}.card`, 'card')
        .andWhere('card.deleted = :cardDeleted', { cardDeleted: false });
    }

    return qb;
  }

  async create(data: FsrsCard): Promise<FsrsCard> {
    const persistenceModel = FsrsCardMapper.toPersistence(data);
    const newEntity = await this.fsrsCardRepository.save(
      this.fsrsCardRepository.create(persistenceModel),
    );
    return FsrsCardMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
    deckId,
  }: {
    paginationOptions: IPaginationOptions;
    deckId?: string;
  }): Promise<FsrsCard[]> {
    const qb = this.createBaseQueryBuilder('fsrs_card', true);

    if (deckId) {
      qb.andWhere('card.deckId = :deckId', { deckId });
    }

    const entities = await qb
      .orderBy('fsrs_card.due', 'ASC')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .getMany();

    return entities.map((entity) => FsrsCardMapper.toDomain(entity));
  }

  async findById(id: FsrsCard['id']): Promise<NullableType<FsrsCard>> {
    const entity = await this.fsrsCardRepository.findOne({
      where: { id, deleted: false },
    });

    return entity ? FsrsCardMapper.toDomain(entity) : null;
  }

  async findByCardId(cardId: string): Promise<NullableType<FsrsCard>> {
    // Используем индекс для быстрого поиска
    const entity = await this.fsrsCardRepository.findOne({
      where: { cardId, deleted: false },
      cache: 30000, // Кэшируем на 30 секунд
    });

    return entity ? FsrsCardMapper.toDomain(entity) : null;
  }

  async findByCardIds(cardIds: string[]): Promise<FsrsCard[]> {
    if (cardIds.length === 0) return [];

    const entities = await this.fsrsCardRepository.find({
      where: {
        cardId: In(cardIds),
        deleted: false,
      },
      cache: 30000,
    });

    return entities.map((entity) => FsrsCardMapper.toDomain(entity));
  }

  /**
   * ОПТИМИЗИРОВАННЫЙ метод поиска готовых карточек с JOIN
   */
  async findDueCards(
    userId: string,
    now: Date,
  ): Promise<FsrsCardWithContent[]> {
    const entities = await this.createBaseQueryBuilder('fsrs_card', true)
      .andWhere('card.userId = :userId', { userId })
      .andWhere('fsrs_card.due <= :now', { now })
      .andWhere('fsrs_card.suspended <= :now', { now })
      .orderBy('fsrs_card.due', 'ASC')
      .addOrderBy('fsrs_card.createdAt', 'ASC') // Дополнительная сортировка для стабильности
      .getMany();

    return entities.map((entity) =>
      FsrsCardMapper.toFsrsCardWithContent(entity),
    );
  }

  /**
   * ОПТИМИЗИРОВАННЫЙ метод поиска готовых карточек по колоде с JOIN
   */
  async findDueCardsByDeckId(
    deckId: string,
    now: Date,
  ): Promise<FsrsCardWithContent[]> {
    const entities = await this.createBaseQueryBuilder('fsrs_card', true)
      .andWhere('card.deckId = :deckId', { deckId })
      .andWhere('fsrs_card.due <= :now', { now })
      .andWhere('fsrs_card.suspended <= :now', { now })
      .orderBy('fsrs_card.due', 'ASC')
      .addOrderBy('fsrs_card.createdAt', 'ASC')
      .getMany();

    return entities.map((entity) =>
      FsrsCardMapper.toFsrsCardWithContent(entity),
    );
  }

  /**
   * Новый метод: поиск карточек по состоянию с пагинацией
   */
  async findByState(
    state: State,
    paginationOptions: IPaginationOptions,
    userId?: string,
  ): Promise<FsrsCardWithContent[]> {
    const qb = this.createBaseQueryBuilder('fsrs_card', true).andWhere(
      'fsrs_card.state = :state',
      { state },
    );

    if (userId) {
      qb.andWhere('card.userId = :userId', { userId });
    }

    const entities = await qb
      .orderBy('fsrs_card.due', 'ASC')
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit)
      .getMany();

    return entities.map((entity) =>
      FsrsCardMapper.toFsrsCardWithContent(entity),
    );
  }

  /**
   * Новый метод: получение статистики по состояниям карточек
   */
  async getStateStatistics(userId: string): Promise<Record<string, number>> {
    const result = await this.createBaseQueryBuilder('fsrs_card')
      .leftJoin('fsrs_card.card', 'card')
      .select('fsrs_card.state', 'state')
      .addSelect('COUNT(fsrs_card.id)', 'count')
      .where('card.userId = :userId', { userId })
      .andWhere('card.deleted = :cardDeleted', { cardDeleted: false })
      .groupBy('fsrs_card.state')
      .getRawMany();

    const statistics: Record<string, number> = {
      New: 0,
      Learning: 0,
      Review: 0,
      Relearning: 0,
    };

    result.forEach((row) => {
      statistics[row.state] = parseInt(row.count, 10);
    });

    return statistics;
  }

  /**
   * Новый метод: получение карточек с истечением срока в ближайшие дни
   */
  async findUpcomingDueCards(
    userId: string,
    days: number = 7,
  ): Promise<FsrsCardWithContent[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const entities = await this.createBaseQueryBuilder('fsrs_card', true)
      .andWhere('card.userId = :userId', { userId })
      .andWhere('fsrs_card.due > :now', { now })
      .andWhere('fsrs_card.due <= :futureDate', { futureDate })
      .andWhere('fsrs_card.suspended <= :now', { now })
      .orderBy('fsrs_card.due', 'ASC')
      .getMany();

    return entities.map((entity) =>
      FsrsCardMapper.toFsrsCardWithContent(entity),
    );
  }

  /**
   * Пакетное обновление карточек для оптимизации производительности
   */
  async batchUpdate(
    updates: Array<{ id: string; data: Partial<FsrsCard> }>,
  ): Promise<void> {
    if (updates.length === 0) return;

    // Группируем обновления по типу для оптимизации
    const queries = updates.map(({ id, data }) => {
      return this.fsrsCardRepository
        .createQueryBuilder()
        .update()
        .set(data)
        .where('id = :id', { id })
        .execute();
    });

    await Promise.all(queries);
  }

  async update(
    id: FsrsCard['id'],
    payload: Partial<FsrsCard>,
  ): Promise<FsrsCard> {
    const entity = await this.fsrsCardRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('FsrsCard not found');
    }

    const updatedEntity = await this.fsrsCardRepository.save(
      this.fsrsCardRepository.create(
        FsrsCardMapper.toPersistence({
          ...FsrsCardMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return FsrsCardMapper.toDomain(updatedEntity);
  }

  async remove(id: FsrsCard['id']): Promise<void> {
    // Мягкое удаление с оптимизацией
    await this.fsrsCardRepository
      .createQueryBuilder()
      .update()
      .set({ deleted: true })
      .where('id = :id', { id })
      .execute();
  }
}
