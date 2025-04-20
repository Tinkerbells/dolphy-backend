import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMarketCommentDto {
  @ApiProperty({
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор колоды в маркетплейсе',
  })
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  marketDeckId: string;

  @ApiProperty({
    example: 'Отличная колода для начинающих! Очень помогла в изучении.',
    description: 'Текст комментария',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, {
    message: 'Комментарий должен быть не более 1000 символов',
  })
  text: string;

  @ApiProperty({
    type: Number,
    example: 5,
    description: 'Оценка от 1 до 5',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;
}
