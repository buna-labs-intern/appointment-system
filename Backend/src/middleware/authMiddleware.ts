import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";
import prisma from "../shared/prisma";

export interface BranchSummary {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "ADMIN" | "RECEPTIONIST" | "SUPER_ADMIN";
    fullName: string;
    branchIds: string[];
    branchAll: boolean;
    branches: BranchSummary[];
    tenantId: string | null;
    tenantSlug: string | null;
    tenantName: string | null;
    mustChangePassword: boolean;
  };
  branchContext?: {
    branchIds: string[];
    branchAll: boolean;
    tenantId: string | null;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || "appointment_system_jwt_secret_key_2026";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "You are not authenticated. Please log in.");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError(401, "Invalid authorization token.");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: "ADMIN" | "RECEPTIONIST" | "SUPER_ADMIN";
      branchIds?: string[];
      branchAll?: boolean;
      tenantId?: string | null;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        tenant: { select: { id: true, name: true, slug: true, isActive: true } },
        userBranches: {
          include: { branch: { select: { id: true, name: true, slug: true, isActive: true } } },
        },
      },
    });

    if (!user) {
      throw new AppError(401, "User belonging to this token no longer exists.");
    }

    if (!user.isActive) {
      throw new AppError(403, "Your account has been deactivated. Please contact an administrator.");
    }

    if (user.tenant && !user.tenant.isActive) {
      throw new AppError(403, "Clinic is banned. Contact platform administrator.");
    }

    const branchIds = user.userBranches.map((ub) => ub.branchId);
    const branchAll = branchIds.length === 0;
    const branches = user.userBranches
      .map((ub) => ub.branch)
      .filter(Boolean)
      .map((b) => ({ id: b!.id, name: b!.name, slug: b!.slug, isActive: b!.isActive }));

    if (!branchAll && branchIds.length === 1) {
      const only = branches[0];
      if (only && !only.isActive) {
        throw new AppError(403, `Your branch "${only.name}" is archived. Contact administrator.`);
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "RECEPTIONIST" | "SUPER_ADMIN",
      fullName: user.fullName,
      branchIds,
      branchAll,
      branches,
      tenantId: user.tenant?.id ?? null,
      tenantSlug: user.tenant?.slug ?? null,
      tenantName: user.tenant?.name ?? null,
      mustChangePassword: user.mustChangePassword,
    };
    (req as any).branchContext = {
      branchIds,
      branchAll,
      tenantId: user.tenant?.id ?? null,
    };

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new AppError(401, "Invalid or expired session token. Please log in again."));
    } else {
      next(error);
    }
  }
};

export const authorize = (
  ...allowedRoles: ("ADMIN" | "RECEPTIONIST" | "SUPER_ADMIN")[]
) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "You are not authenticated."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(403, "You do not have permission to perform this action.")
      );
    }

    next();
  };
};

export const forbidSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === "SUPER_ADMIN") {
    return next(new AppError(403, "Platform administrators cannot access clinic data."));
  }
  next();
};
