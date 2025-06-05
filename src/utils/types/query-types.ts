import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Базовые типы для пагинации
 */
export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Типы для сортировки
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface ISortOption<T = any> {
  field: keyof T;
  order: SortOrder;
}

/**
 * Базовые типы для фильтрации
 */
export interface IFilterOption {
  field: string;
  operator: FilterOperator;
  value: any;
}

export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  LIKE = 'like',
  ILIKE = 'ilike',
  IN = 'in',
  NOT_IN = 'not_in',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  BETWEEN = 'between',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
}

/**
 * Тип для поискового запроса
 */
export interface ISearchQuery {
  query: string;
  fields?: string[];
}

/**
 * Универсальный интерфейс для параметров запроса
 */
export interface IUniversalQueryOptions<T = any> {
  pagination?: IPaginationOptions;
  sort?: ISortOption<T>[];
  filters?: IFilterOption[];
  search?: ISearchQuery;
}

/**
 * Результат универсального запроса
 */
export interface IUniversalQueryResult<T> {
  data: T[];
  meta: IPaginationMeta;
}

/**
 * Базовые DTO классы
 */

/**
 * Базовый DTO для пагинации
 */
export class BasePaginationDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number = 10;
}

/**
 * DTO для сортировки
 */
export class BaseSortDto<T = any> {
  @ApiPropertyOptional({
    description: 'Поле для сортировки',
    example: 'createdAt',
  })
  @IsString()
  @IsOptional()
  field?: keyof T;

  @ApiPropertyOptional({
    description: 'Направление сортировки',
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder = SortOrder.DESC;
}

/**
 * DTO для фильтрации
 */
export class BaseFilterDto {
  @ApiPropertyOptional({
    description: 'Поле для фильтрации',
    example: 'status',
  })
  @IsString()
  field: string;

  @ApiPropertyOptional({
    description: 'Оператор фильтрации',
    enum: FilterOperator,
    example: FilterOperator.EQUALS,
  })
  @IsEnum(FilterOperator)
  operator: FilterOperator;

  @ApiPropertyOptional({
    description: 'Значение для фильтрации',
    example: 'active',
  })
  value: any;
}

/**
 * DTO для поиска
 */
export class BaseSearchDto {
  @ApiPropertyOptional({
    description: 'Поисковый запрос',
    example: 'японский язык',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Поля для поиска (через запятую)',
    example: 'title,description',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
    value ? value.split(',').map((field: string) => field.trim()) : undefined,
  )
  searchFields?: string[];
}

/**
 * Универсальный DTO для запросов
 */
export class BaseQueryDto<T = any> extends BasePaginationDto {
  @ApiPropertyOptional({
    description: 'Поисковый запрос',
    example: 'японский язык',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Поля для поиска (через запятую)',
    example: 'title,description',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) =>
    value ? value.split(',').map((field: string) => field.trim()) : undefined,
  )
  searchFields?: string[];

  @ApiPropertyOptional({
    description: 'Поле для сортировки',
    example: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortField?: keyof T;

  @ApiPropertyOptional({
    description: 'Направление сортировки',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Фильтры в формате JSON',
    example: '[{"field":"status","operator":"equals","value":"active"}]',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? JSON.parse(value) : undefined;
    } catch {
      return undefined;
    }
  })
  @ValidateNested({ each: true })
  @Type(() => BaseFilterDto)
  filters?: BaseFilterDto[];
}

/**
 * Типы для построения WHERE условий
 */
export interface IWhereCondition {
  [key: string]: any;
}

export interface IOrderCondition {
  [key: string]: 'ASC' | 'DESC';
}
