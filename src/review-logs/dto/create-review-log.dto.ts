import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RatingType, ratings } from '../domain/review-log';
import { StateType, states } from '../../cards/domain/card';

export class CreateReviewLogDto {
  @ApiProperty({
    type: String,
    description: 'Идентификатор карточки',
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
  })
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  cardId: string;

  @ApiProperty({
    enum: ratings,
    description: 'Оценка повторения',
    example: 'Good',
  })
  @IsEnum(ratings)
  @IsNotEmpty()
  grade: RatingType;

  @ApiProperty({
    enum: states,
    description: 'Состояние карточки',
    example: 'Learning',
  })
  @IsEnum(states)
  @IsNotEmpty()
  state: StateType;

  @ApiProperty({
    type: Date,
    description: 'Дата следующего показа карточки',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  due: Date;

  @ApiProperty({
    type: Number,
    description: 'Стабильность запоминания',
    example: 0.5,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  stability: number;

  @ApiProperty({
    type: Number,
    description: 'Сложность карточки',
    example: 5.0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  difficulty: number;

  @ApiProperty({
    type: Number,
    description: 'Количество дней с последнего повторения',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  elapsed_days: number;

  @ApiProperty({
    type: Number,
    description: 'Количество дней с предпоследнего повторения',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  last_elapsed_days: number;

  @ApiProperty({
    type: Number,
    description: 'Количество запланированных дней до следующего повторения',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  scheduled_days: number;

  @ApiProperty({
    type: Date,
    description: 'Дата повторения',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  review: Date;

  @ApiProperty({
    type: Number,
    description: 'Длительность повторения в миллисекундах',
    example: 5000,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  duration: number;
}
