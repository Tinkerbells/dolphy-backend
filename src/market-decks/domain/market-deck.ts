import { ApiProperty } from '@nestjs/swagger';

/**
 * Представляет опубликованную в маркетплейсе колоду карточек
 */
export class MarketDeck {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Уникальный идентификатор',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор оригинальной колоды',
  })
  deckId: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор автора (пользователя)',
  })
  authorId: string;

  @ApiProperty({
    type: String,
    example: 'Японский язык: базовые иероглифы',
    description: 'Название колоды',
  })
  title: string;

  @ApiProperty({
    type: String,
    example: 'Колода содержит 100 базовых иероглифов для начинающих',
    description: 'Описание колоды',
  })
  description: string;

  @ApiProperty({
    type: [String],
    example: ['japanese', 'language', 'beginner'],
    description: 'Теги колоды для поиска',
  })
  tags: string[];

  @ApiProperty({
    type: Number,
    example: 0,
    description: 'Количество скачиваний колоды',
  })
  downloadCount: number;

  @ApiProperty({
    type: Object,
    example: {
      '1': 14,
      '2': 7,
      '3': 25,
      '4': 104,
      '5': 809,
    },
    description: 'Распределение оценок по значениям',
  })
  ratingBreakdown: Record<string, number>;

  @ApiProperty({
    type: Number,
    example: 5,
    description: 'Количество комментариев к колоде',
  })
  commentsCount: number;

  @ApiProperty({
    type: Number,
    example: 100,
    description: 'Количество карточек в колоде',
  })
  cardsCount: number;

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
