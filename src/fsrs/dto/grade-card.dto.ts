import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Rating, RatingType } from 'ts-fsrs';

export class GradeCardDto {
  @ApiProperty({
    enum: Rating,
    description: 'Оценка повторения',
    example: 'Good',
  })
  @IsEnum(Rating)
  @IsNotEmpty()
  rating: RatingType;
}
