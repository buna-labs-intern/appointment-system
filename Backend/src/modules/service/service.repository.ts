// src/modules/service/service.repository.ts
import prisma from "../../shared/prisma";
import { SearchOptions } from "../../shared/types";
// ✅ Import from utils - these should work now
import { calculatePagination, generateSearchCondition } from "../../utils";

export class ServiceRepository {
  async create(data: any) {
    return await prisma.service.create({
      data: {
        name: data.name,
        price: data.price,
        duration: data.duration,
      },
    });
  }

  async findAll(options: SearchOptions & { isActive?: boolean }) {
    const { page, limit, sortBy, sortOrder, searchTerm, isActive } = options;
    const { skip, take } = calculatePagination(page, limit);

    const searchCondition = generateSearchCondition(searchTerm, ['name']);
    const filterCondition: any = {};
    if (isActive !== undefined) filterCondition.isActive = isActive;

    const where = {
      ...searchCondition,
      ...filterCondition,
    };

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.name = 'asc';
    }

    const [data, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      prisma.service.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return await prisma.service.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            doctor: true,
            patient: true,
          },
        },
      },
    });
  }

  async findByName(name: string) {
    return await prisma.service.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async update(id: string, data: any) {
    return await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        price: data.price,
        duration: data.duration,
        isActive: data.isActive,
      },
    });
  }

  async activate(id: string) {
    return await prisma.service.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string) {
    return await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async delete(id: string) {
    return await prisma.service.delete({
      where: { id },
    });
  }
}

export default new ServiceRepository();