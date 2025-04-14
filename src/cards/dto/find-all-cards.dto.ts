import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class FindAllCardsDto {
  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'ID колоды для фильтрации',
    example: '9f7b5f8e-7b3c-4b9c-8b0a-1d4a7b9c5d6e',
  })
  @IsUUID()
  @IsOptional()
  deckId?: string;

  @ApiPropertyOptional({
    description: 'Фильтрация по тексту карточки',
    example: 'go',
  })
  @IsString()
  @IsOptional()
  searchText?: string;

  @ApiPropertyOptional({
    description: 'Включать удаленные карточки',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDeleted?: boolean;
}
