import prisma from "../../shared/prisma";
import { calculatePagination, generateSearchCondition } from "../../utils";
import { SearchOptions } from "../../shared/Types";

export class UserRepository {
  private includeBranches = {
    userBranches: { include: { branch: { select: { id: true, name: true, slug: true, isActive: true } } } },
    tenant: { select: { id: true, name: true, slug: true } },
  } as const;

  private toBranchPayload(user: any) {
    const branches = (user.userBranches ?? []).map((ub: any) => ub.branch).filter(Boolean);
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      tenantId: user.tenantId ?? null,
      tenant: user.tenant ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      branchIds: branches.map((b: any) => b.id),
      branchAll: branches.length === 0,
      branches,
    };
  }

  async create(data: any) {
    const { branchIds, ...rest } = data;
    const user = await prisma.user.create({
      data: {
        ...rest,
        userBranches: branchIds?.length
          ? { create: branchIds.map((branchId: string) => ({ branchId })) }
          : undefined,
      },
      include: this.includeBranches,
    });
    return this.toBranchPayload(user);
  }

  async findAll(
    options: SearchOptions & { role?: "ADMIN" | "RECEPTIONIST"; isActive?: boolean; branchId?: string; tenantId?: string | null },
  ) {
    const { page, limit, sortBy, sortOrder, searchTerm, role, isActive, branchId, tenantId } = options;
    const { skip, take } = calculatePagination(page, limit);

    const searchCondition = generateSearchCondition(searchTerm, ["fullName", "email"]);
    const filterCondition: any = {};
    if (role) filterCondition.role = role;
    if (isActive !== undefined) filterCondition.isActive = isActive;
    if (branchId) filterCondition.userBranches = { some: { branchId } };
    if (tenantId) filterCondition.tenantId = tenantId;

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

    const [raw, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        include: this.includeBranches,
      }),
      prisma.user.count({ where }),
    ]);

    const data = raw.map((u) => this.toBranchPayload(u));

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
    const user = await prisma.user.findUnique({
      where: { id },
      include: this.includeBranches,
    });
    if (!user) return null;
    return this.toBranchPayload(user);
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, data: any) {
    const { branchIds, ...rest } = data;
    if (branchIds !== undefined) {
      await prisma.userBranch.deleteMany({ where: { userId: id } });
      if (branchIds.length > 0) {
        await prisma.userBranch.createMany({
          data: branchIds.map((branchId: string) => ({ userId: id, branchId })),
          skipDuplicates: true,
        });
      }
    }
    const user = await prisma.user.update({
      where: { id },
      data: rest,
      include: this.includeBranches,
    });
    return this.toBranchPayload(user);
  }

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });
  }
}

export default new UserRepository();
