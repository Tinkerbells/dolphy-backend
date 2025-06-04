import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FsrsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
