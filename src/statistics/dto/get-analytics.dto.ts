import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
  IsEnum,
} from 'class-validator';

/**
 * Тип аналитики
 */
export enum AnalyticsType {
  DAILY_STATS = 'daily_stats',
  RETENTION_CURVE = 'retention_curve',
  LEARNING_CURVE = 'learning_curve',
  CARD_DIFFICULTY = 'card_difficulty',
  REVIEW_HEATMAP = 'review_heatmap',
  REVIEW_TIME = 'review_time',
}

/**
 * Временной интервал для группировки
 */
export enum TimeInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

/**
 * DTO для запроса аналитических данных
 */
export class GetAnalyticsDto {
  /**
   * Тип аналитики
   */
  @ApiPropertyOptional({
    description: 'Тип аналитики',
    enum: AnalyticsType,
    example: AnalyticsType.DAILY_STATS,
  })
  @IsEnum(AnalyticsType)
  @IsOptional()
  type?: AnalyticsType;

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

  /**
   * Временной интервал для группировки данных
   */
  @ApiPropertyOptional({
    description: 'Временной интервал для группировки данных',
    enum: TimeInterval,
    example: TimeInterval.DAY,
  })
  @IsEnum(TimeInterval)
  @IsOptional()
  interval?: TimeInterval;

  /**
   * Лимит количества возвращаемых записей
   */
  @ApiPropertyOptional({
    description: 'Лимит количества возвращаемых записей',
    example: 30,
  })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  limit?: number;
}
