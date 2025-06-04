import { ApiProperty } from '@nestjs/swagger';

export const states = ['New', 'Learning', 'Review', 'Relearning'] as const;
export type StateType = (typeof states)[number];

export class FsrsCard {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Уникальный идентификатор карточки',
  })
  id: string;

  @ApiProperty({
    type: Date,
    description: 'Дата следующего повторения',
  })
  due: Date;

  @ApiProperty({
    type: Number,
    example: 0.5,
    description: 'Стабильность запоминания',
  })
  stability: number;

  @ApiProperty({
    type: Number,
    example: 5.0,
    description: 'Сложность карточки',
  })
  difficulty: number;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Количество дней с последнего повторения',
  })
  elapsed_days: number;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'Запланированное количество дней до следующего повторения',
  })
  scheduled_days: number;

  @ApiProperty({
    type: Number,
    example: 0,
    description: 'Количество повторений',
  })
  reps: number;

  @ApiProperty({
    type: Number,
    example: 0,
    description: 'Количество ошибок',
  })
  lapses: number;

  @ApiProperty({
    type: String,
    enum: states,
    example: 'New',
    description: 'Состояние карточки в процессе обучения',
  })
  state: StateType;

  @ApiProperty({
    type: Date,
    nullable: true,
    description: 'Дата последнего повторения',
  })
  last_review?: Date;

  @ApiProperty({
    type: Date,
    description: 'Дата до которой карточка приостановлена',
  })
  suspended: Date;

  @ApiProperty({
    type: String,
    example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    description: 'Идентификатор пользователя',
  })
  userId: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор колоды',
  })
  deckId: string;

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
}
