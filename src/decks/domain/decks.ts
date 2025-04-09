import { ApiProperty } from '@nestjs/swagger';

export class Decks {
  @ApiProperty({
    type: String,
    description: 'Уникальный идентификатор колоды',
    example: '9f7b5f8e-7b3c-4b9c-8b0a-1d4a7b9c5d6e',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Название колоды',
    example: 'Английские неправильные глаголы',
  })
  title: string;

  @ApiProperty({
    type: String,
    description: 'Описание колоды',
    example:
      'Коллекция распространенных неправильных глаголов английского языка',
    required: false,
  })
  description?: string;

  @ApiProperty({
    type: Boolean,
    description: 'Флаг публичной доступности колоды',
    example: false,
    default: false,
  })
  isPublic: boolean;

  @ApiProperty({
    type: Number,
    description: 'Количество карточек в колоде',
    example: 42,
    default: 0,
  })
  cardsCount: number;

  @ApiProperty({
    type: Number,
    description: 'ID владельца колоды',
    example: 1,
  })
  ownerId?: number;

  @ApiProperty({
    description: 'Дата создания колоды',
    example: '2025-04-09T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления колоды',
    example: '2025-04-09T14:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Дата удаления колоды (для soft delete)',
    example: null,
    required: false,
  })
  deletedAt?: Date;
}
