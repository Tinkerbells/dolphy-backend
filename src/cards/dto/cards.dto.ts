import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CardsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
