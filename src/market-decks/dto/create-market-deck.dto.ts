import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateMarketDeckDto {
  @ApiProperty({
    example: 'cbcfa8b8-3a25-4adb-a9c6-e325f0d0f3ae',
    description: 'Идентификатор оригинальной колоды',
  })
  @IsString()
  @IsUUID('4')
  @IsNotEmpty()
  deckId: string;

  @ApiProperty({
    example: 'Японский язык: базовые иероглифы',
    description: 'Название колоды',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, {
    message: 'Название должно быть не более 100 символов',
  })
  title: string;

  @ApiProperty({
    example: 'Колода содержит 100 базовых иероглифов для начинающих',
    description: 'Описание колоды',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, {
    message: 'Описание должно быть не более 1000 символов',
  })
  description: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['japanese', 'language', 'beginner'],
    description: 'Теги колоды для поиска',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    default: true,
    description: 'Флаг публичной доступности колоды',
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    default: true,
    description: 'Флаг разрешения копирования колоды',
  })
  @IsBoolean()
  @IsOptional()
  isCopyAllowed?: boolean;
}
