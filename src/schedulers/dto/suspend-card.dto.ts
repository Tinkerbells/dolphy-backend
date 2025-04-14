import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean } from 'class-validator';

export class SuspendCardDto {
  @ApiProperty({ description: 'ID карточки', example: 123 })
  @IsNumber()
  cid: number;

  @ApiProperty({ description: 'Приостановить карточку', example: true })
  @IsBoolean()
  suspended: boolean;
}
