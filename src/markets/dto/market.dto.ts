import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MarketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
