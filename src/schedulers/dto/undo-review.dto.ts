import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UndoReviewDto {
  @ApiProperty({ description: 'ID карточки', example: 123 })
  @IsNumber()
  cid: number;

  @ApiProperty({ description: 'ID записи в журнале повторений', example: 456 })
  @IsNumber()
  lid: number;
}
