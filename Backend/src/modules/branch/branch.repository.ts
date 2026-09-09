import prisma from "../../shared/prisma";
import { calculatePagination } from "../../utils";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export class BranchRepository {
  async create(data: { name: string; slug?: string; address?: string; phone?: string; tenantId?: string | null }) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    return prisma.branch.create({
      data: {
        name: data.name.trim(),
        slug,
        address: data.address?.trim() || null,
        phone: data.phone?.trim() || null,
        tenantId: data.tenantId ?? null,
      },
    });
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    includeArchived?: boolean;
  }) {
    if (!options || (!options.page && !options.limit && !options.search && options.isActive === undefined)) {
      const where: any = {};
      if (options?.isActive !== undefined) where.isActive = options.isActive;
      else if (!options?.includeArchived) {
        // by default hide? keep showing all unless filtered
      }
      return prisma.branch.findMany({ where, orderBy: { createdAt: "desc" } });
    }

    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const { skip, take } = calculatePagination(page, limit);

    const where: any = {};
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: "insensitive" } },
        { slug: { contains: options.search, mode: "insensitive" } },
        { address: { contains: options.search, mode: "insensitive" } },
      ];
    }
    if (options.isActive !== undefined) where.isActive = options.isActive;

    const [data, total] = await Promise.all([
      prisma.branch.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.branch.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit: take, total, totalPages: Math.ceil(total / (take || 10)) },
    };
  }

  async findSelect(tenantId?: string | null) {
    return prisma.branch.findMany({
      where: { isActive: true, ...(tenantId ? { tenantId } : {}) },
      select: { id: true, name: true, slug: true, isActive: true, address: true },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string) {
    return prisma.branch.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return prisma.branch.findUnique({ where: { slug } });
  }

  async update(id: string, data: { name?: string; slug?: string; address?: string; phone?: string }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.slug !== undefined) updateData.slug = slugify(data.slug);
    else if (data.name !== undefined) {
      // auto-update slug on name change? keep slug stable unless explicit
    }
    if (data.address !== undefined) updateData.address = data.address?.trim() || null;
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    return prisma.branch.update({ where: { id }, data: updateData });
  }

  async block(id: string, reason?: string) {
    return prisma.branch.update({
      where: { id },
      data: { isActive: false, blockedAt: new Date(), blockedReason: reason?.trim() || null },
    });
  }

  async unblock(id: string) {
    return prisma.branch.update({
      where: { id },
      data: { isActive: true, blockedAt: null, blockedReason: null },
    });
  }

  async delete(id: string) {
    return prisma.branch.delete({ where: { id } });
  }

  async hasHistory(id: string) {
    const [a, d, s, sh] = await Promise.all([
      prisma.appointment.count({ where: { branchId: id } }),
      prisma.doctor.count({ where: { branchId: id } }),
      prisma.service.count({ where: { branchId: id } }),
      prisma.staffShift.count({ where: { branchId: id } }),
    ]);
    return a + d + s + sh > 0;
  }
}

export default new BranchRepository();
