import { ApiProperty } from '@nestjs/swagger';

// Импортируем перечисления из ts-fsrs
export const states = ['New', 'Learning', 'Review', 'Relearning'] as const;
export type StateType = (typeof states)[number];

export class Card {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  id: string;

  @ApiProperty({
    type: Date,
  })
  due: Date;

  @ApiProperty({
    type: Number,
    example: 0.5,
  })
  stability: number;

  @ApiProperty({
    type: Number,
    example: 5.0,
  })
  difficulty: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  elapsed_days: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  scheduled_days: number;

  @ApiProperty({
    type: Number,
    example: 0,
  })
  reps: number;

  @ApiProperty({
    type: Number,
    example: 0,
  })
  lapses: number;

  @ApiProperty({
    type: String,
    enum: states,
    example: 'New',
  })
  state: StateType;

  @ApiProperty({
    type: Date,
    nullable: true,
  })
  last_review?: Date;

  @ApiProperty({
    type: Date,
  })
  suspended: Date;

  @ApiProperty({
    type: String,
    example: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
  })
  userId: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'ID колоды, к которой относится карточка',
  })
  deckId: string;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  deleted: boolean;

  @ApiProperty()
  createdAt: Date;
}
