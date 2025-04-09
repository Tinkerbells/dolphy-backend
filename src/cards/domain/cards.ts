import { ApiProperty } from '@nestjs/swagger';

export class Cards {
  @ApiProperty({
    type: String,
    description: 'Уникальный идентификатор карточки',
    example: '9f7b5f8e-7b3c-4b9c-8b0a-1d4a7b9c5d6e',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Лицевая сторона карточки (вопрос)',
    example: 'to go (прошедшее время)',
  })
  front: string;

  @ApiProperty({
    type: String,
    description: 'Обратная сторона карточки (ответ)',
    example: 'went',
  })
  back: string;

  @ApiProperty({
    type: String,
    description: 'Подсказка для карточки',
    example: 'Используется для обозначения перемещения в прошлом',
    required: false,
  })
  hint?: string;

  @ApiProperty({
    type: Number,
    description: 'Текущий шаг интервала повторения',
    example: 2,
    default: 0,
  })
  intervalStep: number;

  @ApiProperty({
    description: 'Дата следующего повторения карточки',
    example: '2025-04-15T12:00:00Z',
    required: false,
  })
  nextReviewDate?: Date;

  @ApiProperty({
    type: Number,
    description: 'Количество правильных ответов подряд',
    example: 3,
    default: 0,
  })
  correctStreak: number;

  @ApiProperty({
    type: Number,
    description: 'Количество неправильных ответов подряд',
    example: 0,
    default: 0,
  })
  incorrectStreak: number;

  @ApiProperty({
    type: String,
    description: 'ID колоды, которой принадлежит карточка',
    example: '9f7b5f8e-7b3c-4b9c-8b0a-1d4a7b9c5d6e',
  })
  deckId: string;

  @ApiProperty({
    description: 'Дата создания карточки',
    example: '2025-04-09T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления карточки',
    example: '2025-04-09T14:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Дата удаления карточки (для soft delete)',
    example: null,
    required: false,
  })
  deletedAt?: Date;
}
