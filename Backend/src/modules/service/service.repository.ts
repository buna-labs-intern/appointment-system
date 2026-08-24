import prisma from "../../shared/prisma";
import { SearchOptions } from "../../shared/Types";
import { calculatePagination, generateSearchCondition } from "../../utils";

export class ServiceRepository {
  async create(data: any) {
    return prisma.service.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price !== undefined ? Number(data.price) : 0,
        duration: data.duration !== undefined ? Number(data.duration) : 30,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async findAll(options?: SearchOptions & { isActive?: boolean }) {
    if (!options) {
      return prisma.service.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    const { page, limit, sortBy, sortOrder, searchTerm, isActive } = options;
    const { skip, take } = calculatePagination(page, limit);

    const searchCondition = generateSearchCondition(searchTerm, ["name", "description"]);
    const filterCondition: any = {};
    if (isActive !== undefined) filterCondition.isActive = isActive;

    const where = {
      ...searchCondition,
      ...filterCondition,
    };

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || "asc";
    } else {
      orderBy.createdAt = "desc";
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
        page: page || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / (take || 10)),
      },
    };
  }

  async findById(id: string) {
    return prisma.service.findUnique({
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
    return prisma.service.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.duration !== undefined) updateData.duration = Number(data.duration);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.service.update({
      where: { id },
      data: updateData,
    });
  }

  async activate(id: string) {
    return prisma.service.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivate(id: string) {
    return prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async delete(id: string) {
    await prisma.appointment.deleteMany({
      where: { serviceId: id },
    });
    return prisma.service.delete({
      where: { id },
    });
  }
}

export default new ServiceRepository();