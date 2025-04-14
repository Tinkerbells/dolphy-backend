import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SchedulerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
