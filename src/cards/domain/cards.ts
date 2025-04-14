import { ApiProperty } from '@nestjs/swagger';
import { State } from 'ts-fsrs';

export class Cards {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: number;

  @ApiProperty({ example: 'What is TypeScript?' })
  front: string;

  @ApiProperty({ example: 'A statically typed superset of JavaScript' })
  back: string;

  @ApiProperty({ required: false, example: 'Created by Microsoft' })
  hint?: string;

  @ApiProperty({ example: 2 })
  intervalStep: number;

  @ApiProperty({ required: false })
  nextReviewDate?: Date;

  @ApiProperty({ example: 3 })
  correctStreak: number;

  @ApiProperty({ example: 0 })
  incorrectStreak: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  deckId: string;

  @ApiProperty({ enum: State, example: 1 })
  state: State;

  @ApiProperty({ example: false })
  suspended: boolean;

  @ApiProperty({ example: false })
  deleted: boolean;

  @ApiProperty({ example: 1712345678900 })
  createdAt: number;

  @ApiProperty({ example: 1712345678900 })
  updatedAt: number;
}
