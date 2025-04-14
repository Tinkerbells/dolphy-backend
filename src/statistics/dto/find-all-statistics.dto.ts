import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
} from 'class-validator';

/**
 * DTO для получения списка статистики с пагинацией и фильтрацией
 */
export class FindAllStatisticsDto {
  /**
   * Номер страницы (по умолчанию 1)
   */
  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  /**
   * Количество записей на странице (по умолчанию 10)
   */
  @ApiPropertyOptional({
    description: 'Количество записей на странице',
    example: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  /**
   * Фильтр по типу статистики
   */
  @ApiPropertyOptional({
    description: 'Фильтр по типу статистики',
    example: 'daily_review',
  })
  @IsString()
  @IsOptional()
  type?: string;

  /**
   * Фильтр по ID колоды
   */
  @ApiPropertyOptional({
    description: 'Фильтр по ID колоды',
    example: 123,
  })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  did?: number;

  /**
   * Фильтр по множеству ID колод
   */
  @ApiPropertyOptional({
    description: 'Фильтр по множеству ID колод',
    example: [123, 456],
  })
  @Transform(({ value }) => {
    if (!value) return undefined;
    return Array.isArray(value) ? value.map(Number) : [Number(value)];
  })
  @IsArray()
  @IsOptional()
  dids?: number[];

  /**
   * Фильтр по ID карточки
   */
  @ApiPropertyOptional({
    description: 'Фильтр по ID карточки',
    example: 456,
  })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  cid?: number;

  /**
   * Дата начала для фильтрации (включительно)
   */
  @ApiPropertyOptional({
    description: 'Дата начала для фильтрации (включительно)',
    example: '2025-01-01',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  /**
   * Дата окончания для фильтрации (включительно)
   */
  @ApiPropertyOptional({
    description: 'Дата окончания для фильтрации (включительно)',
    example: '2025-04-14',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
