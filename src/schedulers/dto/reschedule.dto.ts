import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional } from 'class-validator';
import { FSRSParameters } from '../../fsrs/domain/fsrs-parameters';

export class RescheduleDto {
  @ApiProperty({ description: 'Массив ID карточек', example: [123, 456, 789] })
  @IsArray()
  cids: number[];

  @ApiPropertyOptional({ description: 'Параметры FSRS' })
  @IsObject()
  @IsOptional()
  parameters?: FSRSParameters;
}
