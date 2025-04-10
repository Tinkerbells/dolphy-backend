import { ApiProperty } from '@nestjs/swagger';

export enum CardStatus {
  NEW = 'new', // Новая карточка
  LEARNING = 'learning', // Карточка в процессе изучения
  REVIEW = 'review', // Карточка на повторении
  RELEARNING = 'relearning', // Карточка на переизучении
}

export class StudySessionCard {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'ID сессии обучения',
    type: String,
  })
  sessionId: string;

  @ApiProperty({
    description: 'ID карточки',
    type: String,
  })
  cardId: string;

  @ApiProperty({
    enum: CardStatus,
    description: 'Статус карточки в процессе обучения',
  })
  status: CardStatus;

  @ApiProperty({
    description: 'Интервал повторения (в днях)',
  })
  interval: number;

  @ApiProperty({
    description: 'Фактор легкости (множитель для интервала)',
  })
  easeFactor: number;

  @ApiProperty({
    description: 'Количество правильных ответов подряд',
  })
  consecutiveCorrect: number;

  @ApiProperty({
    description: 'Дата следующего повторения',
    type: Date,
    nullable: true,
  })
  dueDate?: Date;

  @ApiProperty({
    description: 'Завершена ли карточка в текущей сессии',
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Количество попыток ответа на карточку',
  })
  attempts: number;

  @ApiProperty({
    description: 'Время последнего просмотра',
    type: Date,
    nullable: true,
  })
  lastReviewedAt?: Date;

  @ApiProperty({
    description: 'Последний ответ пользователя (1-4)',
    nullable: true,
  })
  lastAnswer?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
