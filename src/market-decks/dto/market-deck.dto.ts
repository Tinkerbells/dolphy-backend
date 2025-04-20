import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MarketDeckDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
