import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Rating } from '../domain/fsrs-card';

export class GradeCardDto {
  @ApiProperty({
    enum: Rating,
    description: `Оценка повторения`,
    example: Rating.Good,
  })
  @IsEnum(Rating)
  @IsNotEmpty()
  rating: Rating;
}
