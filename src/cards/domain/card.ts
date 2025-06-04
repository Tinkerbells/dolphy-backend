import { ApiProperty } from '@nestjs/swagger';

export class Card {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Уникальный идентификатор контента карточки',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор связанной карточки для обучения',
  })
  studyCardId: string;

  @ApiProperty({
    type: String,
    example: 'Как будет "привет" на японском?',
    description: 'Вопрос (передняя сторона карточки)',
  })
  question: string;

  @ApiProperty({
    type: String,
    example: 'こんにちは (конничива)',
    description: 'Ответ (задняя сторона карточки)',
  })
  answer: string;

  @ApiProperty({
    type: String,
    example: 'manual',
    description: 'Источник создания карточки',
    enum: ['manual', 'obsidian', 'import'],
  })
  source: string;

  @ApiProperty({
    type: Object,
    description: 'Дополнительные метаданные',
    required: false,
  })
  metadata?: Record<string, any>;

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
