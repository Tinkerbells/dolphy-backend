import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateDecksDto {
  @ApiProperty({
    description: 'Название колоды',
    example: 'Английские неправильные глаголы',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Описание колоды',
    example:
      'Коллекция распространенных неправильных глаголов английского языка',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Флаг публичной доступности колоды',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({
    description: 'ID владельца колоды',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  ownerId?: number;
}
