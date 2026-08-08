// src/shared/types.ts

/**
 * Pagination options for API requests
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search options extending pagination
 */
export interface SearchOptions extends PaginationOptions {
  searchTerm?: string;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Paginated response with metadata
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}