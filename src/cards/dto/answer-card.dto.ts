import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class AnswerCardDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isCorrect: boolean;
}
