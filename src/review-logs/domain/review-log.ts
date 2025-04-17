import { ApiProperty } from '@nestjs/swagger';
import { states } from '../../cards/domain/card';

export const ratings = ['Manual', 'Again', 'Hard', 'Good', 'Easy'] as const;
export type RatingType = (typeof ratings)[number];

export class ReviewLog {
  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  cardId: string;

  @ApiProperty({
    type: String,
    enum: ratings,
    example: 'Good',
  })
  grade: RatingType;

  @ApiProperty({
    type: String,
    enum: states,
    example: 'Learning',
  })
  state: string;

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
  last_elapsed_days: number;

  @ApiProperty({
    type: Number,
    example: 1,
  })
  scheduled_days: number;

  @ApiProperty({
    type: Date,
  })
  review: Date;

  @ApiProperty({
    type: Number,
    example: 0,
  })
  duration: number;

  @ApiProperty({
    type: Boolean,
    example: false,
  })
  deleted: boolean;

  @ApiProperty()
  createdAt: Date;
}
