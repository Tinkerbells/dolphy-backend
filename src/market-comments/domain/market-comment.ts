import { ApiProperty } from '@nestjs/swagger';

/**
 * Представляет комментарий и оценку для колоды в маркетплейсе
 */
export class MarketComment {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Уникальный идентификатор',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор колоды в маркетплейсе',
  })
  marketDeckId: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор пользователя, оставившего комментарий',
  })
  userId: string;

  @ApiProperty({
    type: String,
    example: 'Отличная колода для начинающих! Очень помогла в изучении.',
    description: 'Текст комментария',
  })
  text: string;

  @ApiProperty({
    type: Number,
    example: 5,
    description: 'Оценка от 1 до 5',
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Флаг удаления',
  })
  deleted: boolean;

  @ApiProperty({
    type: Date,
    description: 'Дата создания',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Дата обновления',
  })
  updatedAt: Date;
}
