import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateNoteDto {
  @ApiProperty({ description: 'Вопрос', example: 'Столица Франции?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'Ответ', example: 'Париж' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiPropertyOptional({
    description: 'Источник',
    example: 'Учебник географии',
  })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional({ description: 'ID источника', example: '12345' })
  @IsString()
  @IsOptional()
  sourceId?: string;

  @ApiPropertyOptional({ description: 'Дополнительные данные' })
  @IsObject()
  @IsOptional()
  extend?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID колоды, к которой принадлежит заметка',
    example: 123,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  deckId?: number;
}
