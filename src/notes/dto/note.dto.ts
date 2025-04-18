import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NoteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
