import { ApiProperty } from '@nestjs/swagger';

/**
 * Доменная сущность для статистических данных обучения
 */
export class Statistic {
  /**
   * Уникальный идентификатор записи статистики
   */
  @ApiProperty({
    description: 'Уникальный идентификатор записи статистики',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  /**
   * ID пользователя
   */
  @ApiProperty({
    description: 'ID пользователя',
    example: 42,
  })
  uid: number;

  /**
   * ID колоды
   */
  @ApiProperty({
    description: 'ID колоды',
    example: 123,
  })
  did?: number;

  /**
   * ID карточки (опционально)
   */
  @ApiProperty({
    description: 'ID карточки',
    example: 456,
    required: false,
  })
  cid?: number;

  /**
   * Тип статистики (daily_review, card_performance, etc.)
   */
  @ApiProperty({
    description: 'Тип статистики',
    example: 'daily_review',
  })
  type: string;

  /**
   * Данные статистики в формате JSON
   */
  @ApiProperty({
    description: 'Данные статистики',
    example: {
      cardsStudied: 25,
      correctAnswers: 18,
      timeSpentMs: 1200000,
    },
  })
  data: Record<string, any>;

  /**
   * Временная метка создания записи
   */
  @ApiProperty({
    description: 'Временная метка создания записи',
    example: 1681459200000,
  })
  createdAt: number;

  /**
   * Временная метка обновления записи
   */
  @ApiProperty({
    description: 'Временная метка обновления записи',
    example: 1681459200000,
  })
  updatedAt: number;
}
