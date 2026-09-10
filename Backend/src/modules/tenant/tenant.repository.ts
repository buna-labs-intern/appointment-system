import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "../../shared/prisma";

type PrismaTx = Prisma.TransactionClient | PrismaClient;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const tenantInclude = {
  _count: { select: { branches: true, users: true, patients: true } },
  defaultBranch: { select: { id: true, name: true, slug: true } },
  users: {
    where: { role: "ADMIN" },
    select: { id: true, fullName: true, email: true, phone: true, isActive: true },
    take: 3,
    orderBy: { createdAt: "asc" as const },
  },
} as const;

function pickPrimaryOwner(users: { id: string; fullName: string; email: string; phone: string | null; isActive: boolean }[] | undefined) {
  if (!users || users.length === 0) return null;
  return users.find((u) => u.isActive) ?? users[0];
}

function withOwner<T extends { users?: { id: string; fullName: string; email: string; phone: string | null; isActive: boolean }[] }>(
  tenant: T,
) {
  const { users, ...rest } = tenant;
  return { ...rest, owner: pickPrimaryOwner(users) };
}

export const TenantRepository = {
  slugify,

  async create(tx: PrismaTx, data: Prisma.TenantCreateInput) {
    return tx.tenant.create({ data, include: tenantInclude });
  },

  async findAll(options: {
    page: number;
    limit: number;
    searchTerm?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const { page, limit, searchTerm, isActive, sortBy = "createdAt", sortOrder = "desc" } = options;

    const where: Prisma.TenantWhereInput = {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" as const } },
              { slug: { contains: searchTerm, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.tenant.count({ where }),
      prisma.tenant.findMany({
        where,
        include: tenantInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { total, page, limit, items: items.map(withOwner) };
  },

  async findById(id: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id }, include: tenantInclude });
    return tenant ? withOwner(tenant) : tenant;
  },

  async findBySlug(slug: string) {
    return prisma.tenant.findUnique({ where: { slug } });
  },

  async update(id: string, data: Prisma.TenantUpdateInput) {
    return prisma.tenant.update({ where: { id }, data, include: tenantInclude }).then((t) => t && withOwner(t));
  },

  async block(id: string, reason?: string) {
    return prisma.tenant
      .update({
        where: { id },
        data: { isActive: false, blockedAt: new Date(), blockedReason: reason ?? null },
        include: tenantInclude,
      })
      .then((t) => withOwner(t));
  },

  async unblock(id: string) {
    return prisma.tenant
      .update({
        where: { id },
        data: { isActive: true, blockedAt: null, blockedReason: null },
        include: tenantInclude,
      })
      .then((t) => withOwner(t));
  },

  async delete(id: string) {
    return prisma.tenant.delete({ where: { id } });
  },

  async hasHistory(id: string) {
    const [branches, users, patients] = await Promise.all([
      prisma.branch.count({ where: { tenantId: id } }),
      prisma.user.count({ where: { tenantId: id } }),
      prisma.patient.count({ where: { tenantId: id } }),
    ]);
    return branches > 0 || users > 0 || patients > 0;
  },

  async listBranches(tenantId: string) {
    return prisma.branch.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        phone: true,
        isActive: true,
        blockedAt: true,
        blockedReason: true,
        createdAt: true,
        _count: { select: { doctors: true, appointments: true, userBranches: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },
};

export default TenantRepository;
