import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeckDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
