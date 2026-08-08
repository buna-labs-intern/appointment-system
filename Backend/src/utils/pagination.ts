// src/utils/pagination.ts

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Calculate pagination skip and take values
 */
export const calculatePagination = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take };
};

/**
 * Generate pagination metadata
 */
export const generatePaginationMeta = (page: number, limit: number, total: number) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};