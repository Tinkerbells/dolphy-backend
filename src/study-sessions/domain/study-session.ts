import { ApiProperty } from '@nestjs/swagger';
import { StudySessionCard } from './study-session-card';

export class StudySession {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'ID пользователя',
  })
  userId: number;

  @ApiProperty({
    description: 'ID колоды',
  })
  deckId: string;

  @ApiProperty({
    description: 'Общее количество карточек в сессии',
  })
  totalCards: number;

  @ApiProperty({
    description: 'Количество завершенных карточек',
  })
  cardsCompleted: number;

  @ApiProperty({
    description: 'Количество правильно отвеченных карточек',
  })
  cardsCorrect: number;

  @ApiProperty({
    description: 'Завершена ли сессия',
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Карточки в сессии',
    type: [StudySessionCard],
    isArray: true,
  })
  cards?: StudySessionCard[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
