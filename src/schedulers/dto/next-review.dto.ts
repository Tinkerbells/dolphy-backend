import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsInt, Min, Max, IsOptional } from 'class-validator';
import { Grade } from 'ts-fsrs';

export class NextReviewDto {
  @ApiProperty({ description: 'ID карточки', example: 123 })
  @IsNumber()
  cid: number;

  @ApiProperty({
    description: 'Оценка ответа (1-Again, 2-Hard, 3-Good, 4-Easy)',
    example: 3,
  })
  @IsInt()
  @Min(1)
  @Max(4)
  rating: Grade;

  @ApiProperty({
    description: 'Временная метка повторения (timestamp)',
    example: 1712345678900,
  })
  @IsNumber()
  timestamp: number;

  @ApiProperty({ description: 'Смещение времени в минутах', example: 0 })
  @IsNumber()
  offset: number;

  @ApiPropertyOptional({
    description: 'Продолжительность повторения в мс',
    example: 5000,
  })
  @IsNumber()
  @IsOptional()
  duration?: number;
}
