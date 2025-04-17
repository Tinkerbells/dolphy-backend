import { ApiProperty } from '@nestjs/swagger';

export class CardStatisticsDto {
  @ApiProperty({
    description: 'Общее количество карточек',
    type: Number,
    example: 100,
  })
  totalCards: number;

  @ApiProperty({
    description: 'Количество карточек, которые нужно повторить сегодня',
    type: Number,
    example: 15,
  })
  dueToday: number;

  @ApiProperty({
    description:
      'Количество карточек, которые были изучены за последнюю неделю',
    type: Number,
    example: 50,
  })
  learnedLastWeek: number;

  @ApiProperty({
    description: 'Средний показатель успешных ответов',
    type: Number,
    example: 85.5,
  })
  averageSuccessRate: number;

  @ApiProperty({
    description: 'Количество карточек в состоянии "Новая"',
    type: Number,
    example: 20,
  })
  newCards: number;

  @ApiProperty({
    description: 'Количество карточек в состоянии "На изучении"',
    type: Number,
    example: 30,
  })
  learningCards: number;

  @ApiProperty({
    description: 'Количество карточек в состоянии "На повторении"',
    type: Number,
    example: 50,
  })
  reviewCards: number;

  @ApiProperty({
    description: 'Количество приостановленных карточек',
    type: Number,
    example: 10,
  })
  suspendedCards: number;
}
