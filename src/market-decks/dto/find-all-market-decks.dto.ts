import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum MarketDeckSortField {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  DOWNLOAD_COUNT = 'downloadCount',
  RATING = 'rating',
}

export class FindAllMarketDecksDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Фильтрация по идентификатору автора',
    example: '',
  })
  @IsString()
  @IsUUID('4')
  @IsOptional()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Полнотекстовый поиск по названию и описанию',
    example: 'японский язык',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Фильтрация по тегам (через запятую)',
    example: 'japanese,language',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value ? value.split(',') : []))
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Поле для сортировки',
    enum: MarketDeckSortField,
    default: MarketDeckSortField.CREATED_AT,
  })
  @IsEnum(MarketDeckSortField)
  @IsOptional()
  sortBy?: MarketDeckSortField = MarketDeckSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Направление сортировки',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortDirection?: 'ASC' | 'DESC' = 'DESC';
}
