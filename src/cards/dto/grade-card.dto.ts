import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { RatingType, ratings } from '../../review-logs/domain/review-log';

export class GradeCardDto {
  @ApiProperty({
    enum: ratings,
    description: 'Оценка повторения',
    example: 'Good',
  })
  @IsEnum(ratings)
  @IsNotEmpty()
  rating: RatingType;
}
