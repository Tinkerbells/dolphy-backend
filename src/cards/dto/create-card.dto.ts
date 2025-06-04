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

export class CardMetadataDto {
  @ApiPropertyOptional({
    type: [String],
    example: ['japanese', 'language', 'greetings'],
    description: 'Метки карточки',
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

  @ApiPropertyOptional({
    type: String,
    example: '12345abcde',
    description: 'Идентификатор карточки в исходной системе',
  })
  @IsString()
  @IsOptional()
  sourceId?: string;
}

export class CreateCardDto {
  @ApiProperty({
    example: 'Как будет "привет" на японском?',
    description: 'Вопрос карточки',
  })
  @IsString()
  @IsNotEmpty({ message: 'Вопрос карточки обязателен' })
  @MaxLength(1000, {
    message: 'Вопрос карточки должен быть не более 1000 символов',
  })
  question: string;

  @ApiProperty({
    example: 'こんにちは (конничива)',
    description: 'Ответ карточки',
  })
  @IsString()
  @IsNotEmpty({ message: 'Ответ карточки обязателен' })
  @MaxLength(2000, {
    message: 'Ответ карточки должен быть не более 2000 символов',
  })
  answer: string;

  @ApiProperty({
    type: String,
    example: 'manual',
    description: 'Источник карточки',
    enum: ['manual', 'obsidian', 'import'],
  })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiPropertyOptional({
    type: CardMetadataDto,
    description: 'Метаданные карточки',
  })
  @Type(() => CardMetadataDto)
  @IsOptional()
  metadata?: CardMetadataDto;

  @ApiProperty({
    type: String,
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор колоды, к которой относится карточка',
  })
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  deckId: string;
}
