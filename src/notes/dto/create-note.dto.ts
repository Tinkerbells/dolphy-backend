import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NoteMetadataDto {
  @ApiPropertyOptional({
    type: [String],
    example: ['japanese', 'language', 'greetings'],
    description: 'Метки заметки',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    type: String,
    example: 'Japanese/Greetings.md',
    description: 'Имя файла (для импорта из внешних источников)',
  })
  @IsString()
  @IsOptional()
  filename?: string;

  @ApiProperty({
    type: String,
    example: 'obsidian',
    description: 'Источник заметки',
    enum: ['obsidian', 'manual', 'import'],
  })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiPropertyOptional({
    type: String,
    example: '12345abcde',
    description: 'Идентификатор в исходной системе',
  })
  @IsString()
  @IsOptional()
  sourceId?: string;
}

export class CreateNoteDto {
  @ApiProperty({
    example: 'Как будет "привет" на японском?',
    description: 'Вопрос',
  })
  @IsString()
  @IsNotEmpty({ message: 'Вопрос обязателен' })
  @MaxLength(1000, {
    message: 'Вопрос должен быть не более 1000 символов',
  })
  question: string;

  @ApiProperty({
    example: 'こんにちは (конничива)',
    description: 'Ответ',
  })
  @IsString()
  @IsNotEmpty({ message: 'Ответ обязателен' })
  @MaxLength(2000, {
    message: 'Ответ должен быть не более 2000 символов',
  })
  answer: string;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор карточки, к которой относится заметка',
  })
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  cardId: string;

  @ApiPropertyOptional({
    type: NoteMetadataDto,
    description: 'Метаданные заметки',
  })
  @Type(() => NoteMetadataDto)
  @IsOptional()
  metadata?: NoteMetadataDto;
}
