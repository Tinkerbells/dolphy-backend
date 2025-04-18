import { ApiProperty } from '@nestjs/swagger';

export class UserStatisticsDto {
  @ApiProperty({
    description: 'Общее количество карточек во всех колодах',
    type: Number,
    example: 500,
  })
  totalCards: number;

  @ApiProperty({
    description: 'Общее количество колод',
    type: Number,
    example: 8,
  })
  totalDecks: number;

  @ApiProperty({
    description: 'Количество карточек для повторения сегодня',
    type: Number,
    example: 45,
  })
  dueToday: number;

  @ApiProperty({
    description: 'Количество карточек, изученных за последнюю неделю',
    type: Number,
    example: 120,
  })
  learnedLastWeek: number;

  @ApiProperty({
    description: 'Общий процент успешных ответов',
    type: Number,
    example: 82.5,
  })
  overallSuccessRate: number;

  @ApiProperty({
    description: 'Количество карточек в каждом состоянии',
    type: Object,
    example: {
      New: 100,
      Learning: 150,
      Review: 230,
      Relearning: 20,
    },
  })
  cardStates: Record<string, number>;

  @ApiProperty({
    description:
      'Активность по дням (количество повторений за последние 30 дней)',
    type: Object,
    example: {
      '2025-03-19': 25,
      '2025-03-20': 32,
      // ... более дат
      '2025-04-17': 40,
    },
  })
  activityByDay: Record<string, number>;

  @ApiProperty({
    description:
      'Наиболее активные колоды (по количеству повторений за последние 30 дней)',
    type: Array,
    example: [
      { id: 'deck-id-1', name: 'Японский', reviews: 250 },
      { id: 'deck-id-2', name: 'Математика', reviews: 180 },
      { id: 'deck-id-3', name: 'История', reviews: 120 },
    ],
  })
  mostActiveDecks: Array<{ id: string; name: string; reviews: number }>;
}
