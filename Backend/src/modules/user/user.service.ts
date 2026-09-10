import bcrypt from "bcryptjs";
import AppError from "../../utils/AppError";
import prisma from "../../shared/prisma";
import UserRepository from "./user.repository";

export class UserService {
  private static normalizeBranchIds(input: any): string[] | undefined {
    if (input === undefined || input === null) return undefined;
    if (typeof input === "string") return input ? [input] : [];
    if (Array.isArray(input)) return input.filter(Boolean).map(String);
    return undefined;
  }

  private static async validateBranchIds(branchIds?: string[], tenantId?: string | null) {
    if (!branchIds || branchIds.length === 0) return;
    const branches = await prisma.branch.findMany({ where: { id: { in: branchIds } } });
    if (branches.length !== branchIds.length) throw new AppError(400, "One or more branches not found");
    const blocked = branches.find((b) => !b.isActive);
    if (blocked) throw new AppError(400, `Branch "${blocked.name}" is archived and cannot be assigned`);
    if (tenantId) {
      const foreign = branches.find((b) => b.tenantId && b.tenantId !== tenantId);
      if (foreign) throw new AppError(400, "Branch belongs to a different clinic");
    }
  }

  static async create(
    data: {
      fullName: string;
      email: string;
      password?: string;
      role?: "ADMIN" | "RECEPTIONIST";
      isActive?: boolean;
      branchIds?: string[];
      branchId?: string;
      phone?: string;
    },
    ctx?: { tenantId?: string | null } | null
  ) {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await UserRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError(400, "A user with this email already exists");
    }

    const rawIds = (data as any).branchIds ?? (data as any).branchId;
    const branchIds = this.normalizeBranchIds(rawIds) ?? [];
    await this.validateBranchIds(branchIds, ctx?.tenantId);

    const rawPassword = data.password || "Reception@12345";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    return UserRepository.create({
      fullName: data.fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role || "RECEPTIONIST",
      isActive: data.isActive !== undefined ? data.isActive : true,
      phone: data.phone,
      tenantId: ctx?.tenantId ?? null,
      mustChangePassword: true,
      branchIds,
    });
  }

  static async getAll(query: any, ctx?: { tenantId?: string | null } | null) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const searchTerm = query.search || query.searchTerm || query.q;
    const role = query.role;
    const branchId = query.branchId;
    const isActive =
      query.isActive !== undefined
        ? query.isActive === "true" || query.isActive === true
        : undefined;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    return UserRepository.findAll({
      page,
      limit,
      searchTerm,
      role: role === "SUPER_ADMIN" ? role : (role as "ADMIN" | "RECEPTIONIST" | undefined),
      isActive,
      branchId,
      tenantId: ctx?.tenantId,
      sortBy,
      sortOrder,
    });
  }

  static async getById(id: string, ctx?: { tenantId?: string | null } | null) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    if (ctx?.tenantId && user.tenantId && user.tenantId !== ctx.tenantId) {
      throw new AppError(404, "User not found");
    }
    return user;
  }

  static async update(id: string, data: any, ctx?: { tenantId?: string | null } | null) {
    const existing = await UserRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "User not found");
    }
    if (ctx?.tenantId && existing.tenantId && existing.tenantId !== ctx.tenantId) {
      throw new AppError(404, "User not found");
    }

    const updateData: any = {};
    if (data.fullName) updateData.fullName = data.fullName.trim();
    if (data.email) {
      const normalizedEmail = data.email.trim().toLowerCase();
      if (normalizedEmail !== existing.email) {
        const emailTaken = await UserRepository.findByEmail(normalizedEmail);
        if (emailTaken) {
          throw new AppError(400, "Email is already in use by another account");
        }
        updateData.email = normalizedEmail;
      }
    }
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
      updateData.mustChangePassword = true;
    }
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.branchIds !== undefined || data.branchId !== undefined) {
      const raw = data.branchIds !== undefined ? data.branchIds : data.branchId;
      const branchIds = this.normalizeBranchIds(raw) ?? [];
      await this.validateBranchIds(branchIds);
      updateData.branchIds = branchIds;
    }
    if (data.phone !== undefined) updateData.phone = data.phone;

    return UserRepository.update(id, updateData);
  }

  static async activate(id: string, ctx?: { tenantId?: string | null } | null) {
    const existing = await UserRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "User not found");
    }
    if (ctx?.tenantId && existing.tenantId && existing.tenantId !== ctx.tenantId) {
      throw new AppError(404, "User not found");
    }
    return UserRepository.update(id, { isActive: true });
  }

  static async deactivate(id: string, ctx?: { tenantId?: string | null } | null) {
    const existing = await UserRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "User not found");
    }
    if (ctx?.tenantId && existing.tenantId && existing.tenantId !== ctx.tenantId) {
      throw new AppError(404, "User not found");
    }
    return UserRepository.update(id, { isActive: false });
  }

  static async delete(id: string, currentUserId?: string, ctx?: { tenantId?: string | null } | null) {
    if (currentUserId && id === currentUserId) {
      throw new AppError(400, "You cannot delete your own account");
    }

    const existing = await UserRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "User not found");
    }
    if (ctx?.tenantId && existing.tenantId && existing.tenantId !== ctx.tenantId) {
      throw new AppError(404, "User not found");
    }

    return UserRepository.delete(id);
  }
}
