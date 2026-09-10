import BranchRepository from "./branch.repository";
import AppError from "../../utils/AppError";
import prisma from "../../shared/prisma";

export class BranchService {
  static async create(data: any, ctx?: { tenantId?: string | null } | null) {
    if (!data.name?.trim()) throw new AppError(400, "Branch name is required");
    const slug = data.slug?.trim() || data.name.trim();
    const normalized = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await BranchRepository.findBySlug(normalized);
    if (existing) throw new AppError(400, `Branch slug "${normalized}" already exists`);
    return BranchRepository.create({ name: data.name, slug: normalized, address: data.address, phone: data.phone, tenantId: ctx?.tenantId ?? null });
  }

  static async getAll(query: any) {
    const page = query.page ? Number(query.page) : undefined;
    const limit = query.limit ? Number(query.limit) : undefined;
    const search = query.search || query.q || query.searchTerm;
    const isActive =
      query.isActive !== undefined ? query.isActive === "true" || query.isActive === true : undefined;
    return BranchRepository.findAll({ page, limit, search, isActive });
  }

  static async getSelect(ctx?: { tenantId?: string | null } | null) {
    return BranchRepository.findSelect(ctx?.tenantId);
  }

  static async getById(id: string, ctx?: { tenantId?: string | null } | null) {
    await this.assertInTenant(id, ctx?.tenantId ?? null);
    const branch = await BranchRepository.findById(id);
    if (!branch) throw new AppError(404, "Branch not found");
    return branch;
  }

  static async update(id: string, data: any, ctx?: { tenantId?: string | null } | null) {
    await this.assertInTenant(id, ctx?.tenantId ?? null);
    const existing = await BranchRepository.findById(id);
    if (!existing) throw new AppError(404, "Branch not found");
    if (data.slug) {
      const normalized = data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const dup = await BranchRepository.findBySlug(normalized);
      if (dup && dup.id !== id) throw new AppError(400, `Slug "${normalized}" already in use`);
    }
    return BranchRepository.update(id, data);
  }

  static async assertInTenant(id: string, tenantId: string | null | undefined) {
    if (!tenantId) return;
    const branch = await prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new AppError(404, "Branch not found");
    if (branch.tenantId !== tenantId) throw new AppError(403, "You do not have access to this branch");
  }

  static async block(id: string, reason?: string, ctx?: { tenantId?: string | null } | null) {
    await this.assertInTenant(id, ctx?.tenantId ?? null);
    const existing = await BranchRepository.findById(id);
    if (!existing) throw new AppError(404, "Branch not found");
    if (!existing.isActive) throw new AppError(400, "Branch is already archived");
    return BranchRepository.block(id, reason);
  }

  static async unblock(id: string, ctx?: { tenantId?: string | null } | null) {
    await this.assertInTenant(id, ctx?.tenantId ?? null);
    const existing = await BranchRepository.findById(id);
    if (!existing) throw new AppError(404, "Branch not found");
    if (existing.isActive) throw new AppError(400, "Branch is already active");
    return BranchRepository.unblock(id);
  }

  static async delete(id: string, ctx?: { tenantId?: string | null } | null) {
    await this.assertInTenant(id, ctx?.tenantId ?? null);
    const existing = await BranchRepository.findById(id);
    if (!existing) throw new AppError(404, "Branch not found");
    const hasHistory = await BranchRepository.hasHistory(id);
    if (hasHistory) throw new AppError(400, "Cannot delete branch with existing appointments/doctors. Archive it instead.");
    return BranchRepository.delete(id);
  }
}
