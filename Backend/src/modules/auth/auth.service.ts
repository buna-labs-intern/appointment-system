import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../shared/prisma";
import AppError from "../../utils/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "appointment_system_jwt_secret_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export type TenantPayload = {
  id: string;
  name: string;
  slug: string;
} | null;

type BranchSummary = { id: string; name: string; slug: string; isActive: boolean };

type UserWithRelations = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  tenantId: string | null;
  tenant?: { id: string; name: string; slug: string; isActive: boolean } | null;
  userBranches: { branchId: string; branch: BranchSummary & { blockedReason?: string } | null }[];
};

const tenantSelect = { id: true, name: true, slug: true, isActive: true } as const;

export class AuthService {
  private static async getUserAuthData(userId: string) {
    const user = (await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: { select: tenantSelect },
        userBranches: {
          include: {
            branch: {
              select: { id: true, name: true, slug: true, isActive: true, blockedReason: true },
            },
          },
        },
      },
    })) as unknown as UserWithRelations | null;

    if (!user) return null;

    const branchIds = user.userBranches.map((ub) => ub.branchId);
    const branchAll = branchIds.length === 0;
    const branches: BranchSummary[] = user.userBranches
      .map((ub) => ub.branch)
      .filter(Boolean)
      .map((b) => ({ id: b!.id, name: b!.name, slug: b!.slug, isActive: b!.isActive }));

    const tenant: TenantPayload = user.tenant
      ? { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug }
      : null;

    return { user, branchIds, branchAll, branches, tenant };
  }

  static async login(payload: { email: string; password: string }) {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const found = await this.getUserAuthDataByEmail(normalizedEmail);
    if (!found) {
      throw new AppError(401, "Invalid email or password");
    }

    const { user, branchIds, branchAll, branches, tenant } = found;

    if (!user.isActive) {
      throw new AppError(403, "Your account has been deactivated. Please contact an administrator.");
    }

    if (user.tenant && !user.tenant.isActive) {
      throw new AppError(403, "Clinic is banned. Contact platform administrator.");
    }

    if (!branchAll && branchIds.length === 1) {
      const b = branches[0];
      if (b && !b.isActive) {
        throw new AppError(403, `Your branch "${b.name}" is archived. Contact administrator.`);
      }
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = this.signToken(user, branchIds, branchAll, tenant);

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
        tenantId: tenant?.id ?? null,
        branchIds,
        branchAll,
        branches,
      },
      tenant,
    };
  }

  private static async getUserAuthDataByEmail(email: string) {
    const user = (await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: { select: tenantSelect },
        userBranches: {
          include: {
            branch: {
              select: { id: true, name: true, slug: true, isActive: true, blockedReason: true },
            },
          },
        },
      },
    })) as unknown as UserWithRelations | null;
    return user
      ? {
          user,
          branchIds: user.userBranches.map((ub) => ub.branchId),
          branchAll: user.userBranches.length === 0,
          branches: user.userBranches
            .map((ub) => ub.branch)
            .filter(Boolean)
            .map((b) => ({ id: b!.id, name: b!.name, slug: b!.slug, isActive: b!.isActive })),
          tenant: user.tenant
            ? { id: user.tenant.id, name: user.tenant.name, slug: user.tenant.slug }
            : null,
        }
      : null;
  }

  private static signToken(
    user: { id: string; email: string; role: string },
    branchIds: string[],
    branchAll: boolean,
    tenant: TenantPayload
  ) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        branchIds,
        branchAll,
        tenantId: tenant?.id ?? null,
        tenantSlug: tenant?.slug ?? null,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );
  }

  static async getMe(userId: string) {
    const found = await this.getUserAuthData(userId);
    if (!found) {
      throw new AppError(404, "User not found");
    }
    const { user, branchIds, branchAll, branches, tenant } = found;
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      tenantId: tenant?.id ?? null,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
      branchIds,
      branchAll,
      branches,
      tenant,
    };
  }

  static async changePassword(
    userId: string,
    payload: { currentPassword: string; newPassword: string },
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, "User not found");
    }

    const isValid = await bcrypt.compare(payload.currentPassword, user.password);
    if (!isValid) {
      throw new AppError(400, "Current password is incorrect");
    }

    if (payload.currentPassword === payload.newPassword) {
      throw new AppError(400, "New password must be different from the current password");
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, mustChangePassword: false },
    });

    return { message: "Password updated successfully" };
  }
}
