import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class SuspendCardDto {
  @ApiProperty({
    description: 'Дата, до которой карточка будет приостановлена',
    type: Date,
    example: '2025-05-01T12:00:00Z',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  until: Date;
}
