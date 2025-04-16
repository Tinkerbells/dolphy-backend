import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReviewLogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
