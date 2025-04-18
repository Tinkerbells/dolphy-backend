import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StatisticDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
