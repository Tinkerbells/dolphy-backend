import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class RecordAnswerDto {
  @ApiProperty({
    description: 'Правильный ли ответ',
    example: true,
  })
  @IsBoolean()
  isCorrect: boolean;
}
