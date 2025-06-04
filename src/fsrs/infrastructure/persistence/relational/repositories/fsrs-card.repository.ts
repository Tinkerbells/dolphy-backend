import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FsrsCardEntity } from '../entities/fsrs-card.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FsrsCard } from '../../../../domain/fsrs-card';
import { FsrsCardRepository } from '../../fsrs-card.repository';
import { FsrsCardMapper } from '../mappers/fsrs-card.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class FsrsCardRelationalRepository implements FsrsCardRepository {
  constructor(
    @InjectRepository(FsrsCardEntity)
    private readonly fsrsCardRepository: Repository<FsrsCardEntity>,
  ) {}

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
    const queryBuilder = this.fsrsCardRepository
      .createQueryBuilder('fsrs_card')
      .innerJoin('card', 'card', 'card.id = fsrs_card.cardId')
      .where('fsrs_card.deleted = :deleted', { deleted: false })
      .andWhere('card.deleted = :cardDeleted', { cardDeleted: false });

    if (deckId) {
      queryBuilder.andWhere('card.deckId = :deckId', { deckId });
    }

    const entities = await queryBuilder
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
    const entity = await this.fsrsCardRepository.findOne({
      where: { cardId, deleted: false },
    });

    return entity ? FsrsCardMapper.toDomain(entity) : null;
  }

  async findByCardIds(cardIds: string[]): Promise<FsrsCard[]> {
    const entities = await this.fsrsCardRepository.find({
      where: {
        cardId: In(cardIds),
        deleted: false,
      },
    });

    return entities.map((entity) => FsrsCardMapper.toDomain(entity));
  }

  async findDueCards(userId: string, now: Date): Promise<FsrsCard[]> {
    const entities = await this.fsrsCardRepository
      .createQueryBuilder('fsrs_card')
      .innerJoin('card', 'card', 'card.id = fsrs_card.cardId')
      .where('card.userId = :userId', { userId })
      .andWhere('fsrs_card.due <= :now', { now })
      .andWhere('fsrs_card.suspended <= :now', { now })
      .andWhere('fsrs_card.deleted = :deleted', { deleted: false })
      .andWhere('card.deleted = :cardDeleted', { cardDeleted: false })
      .orderBy('fsrs_card.due', 'ASC')
      .getMany();

    return entities.map((entity) => FsrsCardMapper.toDomain(entity));
  }

  async findDueCardsByDeckId(deckId: string, now: Date): Promise<FsrsCard[]> {
    const entities = await this.fsrsCardRepository
      .createQueryBuilder('fsrs_card')
      .innerJoin('card', 'card', 'card.id = fsrs_card.cardId')
      .where('card.deckId = :deckId', { deckId })
      .andWhere('fsrs_card.due <= :now', { now })
      .andWhere('fsrs_card.suspended <= :now', { now })
      .andWhere('fsrs_card.deleted = :deleted', { deleted: false })
      .andWhere('card.deleted = :cardDeleted', { cardDeleted: false })
      .orderBy('fsrs_card.due', 'ASC')
      .getMany();

    return entities.map((entity) => FsrsCardMapper.toDomain(entity));
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
    // Мягкое удаление
    await this.update(id, { deleted: true });
  }
}
