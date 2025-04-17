import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardContentEntity } from '../entities/card-content.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { CardContent } from '../../../../domain/card-content';
import { CardContentRepository } from '../../card-content.repository';
import { CardContentMapper } from '../mappers/card-content.mapper';

@Injectable()
export class CardContentRelationalRepository implements CardContentRepository {
  constructor(
    @InjectRepository(CardContentEntity)
    private readonly cardContentRepository: Repository<CardContentEntity>,
  ) {}

  async create(data: CardContent): Promise<CardContent> {
    const persistenceModel = CardContentMapper.toPersistence(data);
    const newEntity = await this.cardContentRepository.save(
      this.cardContentRepository.create(persistenceModel),
    );
    return CardContentMapper.toDomain(newEntity);
  }

  async findById(id: CardContent['id']): Promise<NullableType<CardContent>> {
    const entity = await this.cardContentRepository.findOne({
      where: { id, deleted: false },
    });

    return entity ? CardContentMapper.toDomain(entity) : null;
  }

  async findByCardId(cardId: string): Promise<NullableType<CardContent>> {
    const entity = await this.cardContentRepository.findOne({
      where: { cardId, deleted: false },
    });

    return entity ? CardContentMapper.toDomain(entity) : null;
  }

  async findBySourceId(sourceId: string): Promise<CardContent[]> {
    const entities = await this.cardContentRepository.find({
      where: { sourceId, deleted: false },
    });

    return entities.map((entity) => CardContentMapper.toDomain(entity));
  }

  async update(
    id: CardContent['id'],
    payload: Partial<CardContent>,
  ): Promise<CardContent> {
    const entity = await this.cardContentRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('CardContent not found');
    }

    const updatedEntity = await this.cardContentRepository.save(
      this.cardContentRepository.create(
        CardContentMapper.toPersistence({
          ...CardContentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CardContentMapper.toDomain(updatedEntity);
  }

  async updateByCardId(
    cardId: string,
    payload: Partial<CardContent>,
  ): Promise<CardContent> {
    const entity = await this.cardContentRepository.findOne({
      where: { cardId },
    });

    if (!entity) {
      throw new Error('CardContent not found for card');
    }

    const updatedEntity = await this.cardContentRepository.save(
      this.cardContentRepository.create(
        CardContentMapper.toPersistence({
          ...CardContentMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return CardContentMapper.toDomain(updatedEntity);
  }

  async remove(id: CardContent['id']): Promise<void> {
    // Мягкое удаление (soft delete)
    const entity = await this.cardContentRepository.findOne({
      where: { id },
    });

    if (entity) {
      entity.deleted = true;
      await this.cardContentRepository.save(entity);
    }
  }
}
