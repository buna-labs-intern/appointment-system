import prisma from "../../shared/prisma";
import { SearchOptions } from "../../shared/Types";
import { calculatePagination, generateSearchCondition } from "../../utils";

export class DoctorRepository {
  async create(data: any) {
    return prisma.doctor.create({
      data: {
        fullName: data.fullName,
        specialty: data.specialty,
        phone: data.phone,
        isActive: data.isActive !== undefined ? data.isActive : true,
        branchId: data.branchId || null,
      },
      include: { branch: { select: { id: true, name: true, slug: true } } },
    });
  }

  async findAll(options?: SearchOptions & { isActive?: boolean; branchId?: string; branchIds?: string[]; branchAll?: boolean; tenantId?: string | null }) {
    if (!options) {
      return prisma.doctor.findMany({
        orderBy: { createdAt: "desc" },
        include: { branch: { select: { id: true, name: true, slug: true } } },
      });
    }

    const { page, limit, sortBy, sortOrder, searchTerm, isActive, branchId, branchIds, branchAll, tenantId } = options as any;
    const { skip, take } = calculatePagination(page, limit);

    const searchCondition = generateSearchCondition(searchTerm, ["fullName", "specialty", "phone"]);
    const filterCondition: any = {};
    if (isActive !== undefined) filterCondition.isActive = isActive;
    if (branchId) filterCondition.branchId = branchId;
    else if (!branchAll && branchIds?.length) filterCondition.branchId = { in: branchIds };
    else if (tenantId) filterCondition.branch = { tenantId };

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
      prisma.doctor.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { branch: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.doctor.count({ where }),
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
    return prisma.doctor.findUnique({
      where: { id },
      include: {
        appointments: true,
      },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.specialty !== undefined) updateData.specialty = data.specialty;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.doctor.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await prisma.appointment.deleteMany({
      where: { doctorId: id },
    });
    return prisma.doctor.delete({
      where: { id },
    });
  }
}

export default new DoctorRepository();