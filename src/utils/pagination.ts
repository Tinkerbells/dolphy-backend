import { PaginationResponseDto } from './dto/pagination-response.dto';
import { IPaginationOptions } from './types/pagination-options';

export const pagination = <T>(
  data: T[],
  total: number,
  options: IPaginationOptions,
): PaginationResponseDto<T> => {
  const { page, limit } = options;

  const from = data.length > 0 ? Math.min((page - 1) * limit + 1, total) : 0; // Ensure 'from' does not exceed total
  const to = data.length > 0 ? Math.min(from + limit - 1, total) : 0; // Ensure 'to' does not exceed total

  // Handle case where page number is beyond available data
  const validPage = from <= total && from > 0;

  return {
    data,
    hasNextPage: data.length === limit && to < total,
    totalRecords: total,
    pageNumber: page,
    pageLimit: limit,
    from: validPage ? from : 0, // If page is invalid, set from to 0
    to: validPage ? to : 0, // If page is invalid, set to to 0
  };
};
