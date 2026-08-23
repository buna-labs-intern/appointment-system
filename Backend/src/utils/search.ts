// src/utils/search.ts
import { Prisma } from '@prisma/client';

// ✅ Make sure this is exported
export const generateSearchCondition = (
  searchTerm?: string, 
  searchFields: string[] = []
) => {
  if (!searchTerm || searchFields.length === 0) return {};
  
  return {
    OR: searchFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as Prisma.QueryMode,
      },
    })),
  };
};

export const generateFilterCondition = (filters: Record<string, any>) => {
  const where: any = {};
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value;
    }
  }
  
  return where;
};

export const generateSortCondition = (sortBy?: string, sortOrder?: 'asc' | 'desc') => {
  if (!sortBy) return { createdAt: 'desc' };
  return { [sortBy]: sortOrder || 'asc' };
};