import DoctorRepository from "./doctor.repository";
import AppError from "../../utils/AppError";
import prisma from "../../shared/prisma";
import { resolveCreateBranchId, assertRecordTenant, type BranchContext } from "../../utils/branchScope";

export class DoctorService {
  static async resolveBranchId(payload: any, ctx: BranchContext | null) {
    return resolveCreateBranchId(payload, ctx);
  }

  static async create(data: any, ctx?: BranchContext | null) {
    if (!data.fullName) throw new AppError(400, "Full name is required");
    if (!data.specialty) throw new AppError(400, "Specialty is required");
    if (!data.phone) throw new AppError(400, "Phone number is required");

    const branchId = ctx !== undefined ? await this.resolveBranchId(data, ctx!) : data.branchId || null;
    return DoctorRepository.create({ ...data, branchId });
  }

  static async getAll(query?: any, ctx?: BranchContext | null) {
    if (!query || Object.keys(query).length === 0) {
      if (ctx) {
        return DoctorRepository.findAll({
          branchIds: ctx.branchIds,
          branchAll: ctx.branchAll,
          tenantId: ctx.tenantId,
        } as any);
      }
      return DoctorRepository.findAll();
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const searchTerm = query.search || query.searchTerm || query.q;
    const branchId = query.branchId;
    const isActive =
      query.isActive !== undefined
        ? query.isActive === "true" || query.isActive === true
        : undefined;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    if (ctx && branchId) {
      if (!ctx.branchAll && ctx.branchIds.length === 1 && branchId !== ctx.branchIds[0]) {
        throw new AppError(403, "You are not assigned to that branch");
      }
      if (!ctx.branchAll && ctx.branchIds.length > 1 && !ctx.branchIds.includes(branchId)) {
        throw new AppError(403, "You are not assigned to that branch");
      }
    }

    return DoctorRepository.findAll({
      page,
      limit,
      searchTerm,
      isActive,
      branchId: branchId || (ctx && !ctx.branchAll && ctx.branchIds.length === 1 ? ctx.branchIds[0] : undefined),
      branchIds: ctx?.branchIds,
      branchAll: ctx?.branchAll,
      tenantId: ctx?.tenantId,
      sortBy,
      sortOrder,
    } as any);
  }

  static async getById(id: string, ctx?: BranchContext | null) {
    const doctor = await DoctorRepository.findById(id);
    if (!doctor) {
      throw new AppError(404, "Doctor not found");
    }
    await assertRecordTenant((doctor as any).branchId, ctx);
    return doctor;
  }

  static async update(id: string, data: any, ctx?: BranchContext | null) {
    const existing = await DoctorRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Doctor not found");
    }
    if (ctx && (existing as any).branchId) {
      const allowed = ctx.branchAll || ctx.branchIds.includes((existing as any).branchId);
      if (!allowed) throw new AppError(403, "You don't have access to this branch's doctor");
      if (ctx.tenantId) {
        const branch = await prisma.branch.findUnique({ where: { id: (existing as any).branchId } });
        if (branch?.tenantId && branch.tenantId !== ctx.tenantId) {
          throw new AppError(403, "You don't have access to this doctor");
        }
      }
    }
    return DoctorRepository.update(id, data);
  }

  static async activate(id: string, ctx?: BranchContext | null) {
    const existing = await DoctorRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Doctor not found");
    }
    await assertRecordTenant((existing as any).branchId, ctx);
    return DoctorRepository.update(id, { isActive: true });
  }

  static async deactivate(id: string, ctx?: BranchContext | null) {
    const existing = await DoctorRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Doctor not found");
    }
    await assertRecordTenant((existing as any).branchId, ctx);
    return DoctorRepository.update(id, { isActive: false });
  }

  static async delete(id: string, ctx?: BranchContext | null) {
    const existing = await DoctorRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Doctor not found");
    }
    await assertRecordTenant((existing as any).branchId, ctx);
    return DoctorRepository.delete(id);
  }
}