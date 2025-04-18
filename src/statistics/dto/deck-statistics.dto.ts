import { ApiProperty } from '@nestjs/swagger';

export class DeckStatisticsDto {
  @ApiProperty({
    description: 'Общее количество карточек в колоде',
    type: Number,
    example: 100,
  })
  totalCards: number;

  @ApiProperty({
    description: 'Количество карточек для повторения сегодня',
    type: Number,
    example: 15,
  })
  dueToday: number;

  @ApiProperty({
    description: 'Количество карточек, изученных за последнюю неделю',
    type: Number,
    example: 50,
  })
  learnedLastWeek: number;

  @ApiProperty({
    description: 'Процент успешных ответов',
    type: Number,
    example: 85.5,
  })
  successRate: number;

  @ApiProperty({
    description: 'Количество новых карточек',
    type: Number,
    example: 20,
  })
  newCards: number;

  @ApiProperty({
    description: 'Количество карточек в процессе изучения',
    type: Number,
    example: 30,
  })
  learningCards: number;

  @ApiProperty({
    description: 'Количество карточек на повторении',
    type: Number,
    example: 50,
  })
  reviewCards: number;

  @ApiProperty({
    description: 'Количество карточек на повторном изучении',
    type: Number,
    example: 5,
  })
  relearningCards: number;

  @ApiProperty({
    description: 'Среднее время повторения (в секундах)',
    type: Number,
    example: 12.5,
  })
  averageReviewTime: number;

  @ApiProperty({
    description:
      'Активность по дням (количество повторений за последние 7 дней)',
    type: Object,
    example: {
      '2025-04-11': 15,
      '2025-04-12': 12,
      '2025-04-13': 20,
      '2025-04-14': 18,
      '2025-04-15': 25,
      '2025-04-16': 10,
      '2025-04-17': 15,
    },
  })
  activityByDay: Record<string, number>;
}
