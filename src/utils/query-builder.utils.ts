import { SelectQueryBuilder, Brackets, ObjectLiteral } from 'typeorm';
import {
  IUniversalQueryOptions,
  IUniversalQueryResult,
  IPaginationMeta,
  FilterOperator,
  SortOrder,
  IWhereCondition,
  IOrderCondition,
  BaseQueryDto,
} from './types/query-types';

/**
 * Конфигурация для построения запросов
 */
export interface IQueryBuilderConfig {
  searchFields?: string[]; // Поля для полнотекстового поиска
  defaultSort?: { field: string; order: SortOrder }; // Сортировка по умолчанию
  allowedSortFields?: string[]; // Разрешенные поля для сортировки
  allowedFilterFields?: string[]; // Разрешенные поля для фильтрации
  maxLimit?: number; // Максимальный лимит для пагинации
}

/**
 * Утилита для построения универсальных запросов с TypeORM
 */
export class UniversalQueryBuilder {
  /**
   * Применяет универсальные параметры запроса к QueryBuilder
   */
  static applyQuery<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: IUniversalQueryOptions,
    config: IQueryBuilderConfig = {},
    alias: string = queryBuilder.alias,
  ): SelectQueryBuilder<T> {
    const {
      searchFields = [],
      defaultSort = { field: 'createdAt', order: SortOrder.DESC },
      allowedSortFields = [],
      allowedFilterFields = [],
      maxLimit = 100,
    } = config;

    // Применяем фильтры
    if (options.filters && options.filters.length > 0) {
      this.applyFilters(
        queryBuilder,
        options.filters,
        allowedFilterFields,
        alias,
      );
    }

    // Применяем поиск
    if (options.search?.query) {
      this.applySearch(queryBuilder, options.search, searchFields, alias);
    }

    // Применяем сортировку
    this.applySort(
      queryBuilder,
      options.sort,
      defaultSort,
      allowedSortFields,
      alias,
    );

    // Применяем пагинацию
    if (options.pagination) {
      this.applyPagination(queryBuilder, options.pagination, maxLimit);
    }

    return queryBuilder;
  }

  /**
   * Применяет фильтры к запросу
   */
  static applyFilters<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    filters: any[],
    allowedFields: string[] = [],
    alias: string,
  ): void {
    filters.forEach((filter, index) => {
      if (allowedFields.length > 0 && !allowedFields.includes(filter.field)) {
        return; // Пропускаем неразрешенные поля
      }

      const paramName = `filter_${index}`;
      const fieldName = `${alias}.${filter.field}`;

      switch (filter.operator) {
        case FilterOperator.EQUALS:
          queryBuilder.andWhere(`${fieldName} = :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case FilterOperator.NOT_EQUALS:
          queryBuilder.andWhere(`${fieldName} != :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case FilterOperator.LIKE:
          queryBuilder.andWhere(`${fieldName} LIKE :${paramName}`, {
            [paramName]: `%${filter.value}%`,
          });
          break;

        case FilterOperator.ILIKE:
          queryBuilder.andWhere(`${fieldName} ILIKE :${paramName}`, {
            [paramName]: `%${filter.value}%`,
          });
          break;

        case FilterOperator.IN:
          if (Array.isArray(filter.value)) {
            queryBuilder.andWhere(`${fieldName} IN (:...${paramName})`, {
              [paramName]: filter.value,
            });
          }
          break;

        case FilterOperator.NOT_IN:
          if (Array.isArray(filter.value)) {
            queryBuilder.andWhere(`${fieldName} NOT IN (:...${paramName})`, {
              [paramName]: filter.value,
            });
          }
          break;

        case FilterOperator.GT:
          queryBuilder.andWhere(`${fieldName} > :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case FilterOperator.GTE:
          queryBuilder.andWhere(`${fieldName} >= :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case FilterOperator.LT:
          queryBuilder.andWhere(`${fieldName} < :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case FilterOperator.LTE:
          queryBuilder.andWhere(`${fieldName} <= :${paramName}`, {
            [paramName]: filter.value,
          });
          break;

        case FilterOperator.BETWEEN:
          if (Array.isArray(filter.value) && filter.value.length === 2) {
            queryBuilder.andWhere(
              `${fieldName} BETWEEN :${paramName}_start AND :${paramName}_end`,
              {
                [`${paramName}_start`]: filter.value[0],
                [`${paramName}_end`]: filter.value[1],
              },
            );
          }
          break;

        case FilterOperator.IS_NULL:
          queryBuilder.andWhere(`${fieldName} IS NULL`);
          break;

        case FilterOperator.IS_NOT_NULL:
          queryBuilder.andWhere(`${fieldName} IS NOT NULL`);
          break;
      }
    });
  }

  /**
   * Применяет поиск к запросу
   */
  static applySearch<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    search: { query: string; fields?: string[] },
    defaultSearchFields: string[] = [],
    alias: string,
  ): void {
    const searchFields = search.fields || defaultSearchFields;

    if (!searchFields.length || !search.query) {
      return;
    }

    queryBuilder.andWhere(
      new Brackets((qb) => {
        searchFields.forEach((field, index) => {
          const paramName = `search_${index}`;
          const fieldName = `${alias}.${field}`;

          if (index === 0) {
            qb.where(`${fieldName} ILIKE :${paramName}`, {
              [paramName]: `%${search.query}%`,
            });
          } else {
            qb.orWhere(`${fieldName} ILIKE :${paramName}`, {
              [paramName]: `%${search.query}%`,
            });
          }
        });
      }),
    );
  }

  /**
   * Применяет сортировку к запросу
   */
  static applySort<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    sortOptions: any[] = [],
    defaultSort: { field: string; order: SortOrder },
    allowedFields: string[] = [],
    alias: string,
  ): void {
    // Очищаем существующую сортировку
    queryBuilder.orderBy({});

    // Применяем пользовательскую сортировку
    sortOptions.forEach((sort, index) => {
      if (allowedFields.length > 0 && !allowedFields.includes(sort.field)) {
        return; // Пропускаем неразрешенные поля
      }

      const fieldName = `${alias}.${sort.field}`;

      if (index === 0) {
        queryBuilder.orderBy(fieldName, sort.order);
      } else {
        queryBuilder.addOrderBy(fieldName, sort.order);
      }
    });

    // Применяем сортировку по умолчанию, если пользовательская не задана
    if (sortOptions.length === 0) {
      const defaultFieldName = `${alias}.${defaultSort.field}`;
      queryBuilder.orderBy(defaultFieldName, defaultSort.order);
    }
  }

  /**
   * Применяет пагинацию к запросу
   */
  static applyPagination<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    pagination: { page: number; limit: number },
    maxLimit: number = 100,
  ): void {
    const limit = Math.min(pagination.limit || 10, maxLimit);
    const page = Math.max(pagination.page || 1, 1);
    const offset = (page - 1) * limit;

    queryBuilder.limit(limit).offset(offset);
  }

  /**
   * Выполняет запрос с подсчетом общего количества записей
   */
  static async executeWithCount<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    pagination?: { page: number; limit: number },
  ): Promise<IUniversalQueryResult<T>> {
    const [data, total] = await queryBuilder.getManyAndCount();

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;

    const meta: IPaginationMeta = {
      page,
      limit,
      total,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };

    return { data, meta };
  }
}

/**
 * Утилита для преобразования DTO в опции запроса
 */
export class QueryDtoTransformer {
  /**
   * Преобразует BaseQueryDto в IUniversalQueryOptions
   */
  static transform<T>(dto: BaseQueryDto<T>): IUniversalQueryOptions<T> {
    const options: IUniversalQueryOptions<T> = {};

    // Пагинация
    if (dto.page || dto.limit) {
      options.pagination = {
        page: dto.page || 1,
        limit: Math.min(dto.limit || 10, 100),
      };
    }

    // Поиск
    if (dto.q) {
      options.search = {
        query: dto.q,
        fields: dto.searchFields,
      };
    }

    // Сортировка
    if (dto.sortField) {
      options.sort = [
        {
          field: dto.sortField,
          order: dto.sortOrder || SortOrder.DESC,
        },
      ];
    }

    // Фильтры
    if (dto.filters && Array.isArray(dto.filters)) {
      options.filters = dto.filters;
    }

    return options;
  }
}

/**
 * Вспомогательные функции для создания условий WHERE
 */
export class WhereBuilder {
  /**
   * Создает простое условие равенства
   */
  static equals(field: string, value: any): IWhereCondition {
    return { [field]: value };
  }

  /**
   * Создает условие LIKE
   */
  static like(field: string, value: string): IWhereCondition {
    return { [field]: `%${value}%` };
  }

  /**
   * Создает условие IN
   */
  static in(field: string, values: any[]): IWhereCondition {
    return { [field]: values };
  }

  /**
   * Создает условие для диапазона дат
   */
  static dateRange(field: string, start: Date, end: Date): IWhereCondition[] {
    return [{ [field]: { $gte: start } }, { [field]: { $lte: end } }];
  }
}

/**
 * Утилита для создания ORDER BY условий
 */
export class OrderBuilder {
  /**
   * Создает простое условие сортировки
   */
  static by(field: string, order: SortOrder = SortOrder.ASC): IOrderCondition {
    return { [field]: order };
  }

  /**
   * Создает множественную сортировку
   */
  static multiple(
    sorts: Array<{ field: string; order?: SortOrder }>,
  ): IOrderCondition {
    const result: IOrderCondition = {};
    sorts.forEach(({ field, order = SortOrder.ASC }) => {
      result[field] = order;
    });
    return result;
  }
}
