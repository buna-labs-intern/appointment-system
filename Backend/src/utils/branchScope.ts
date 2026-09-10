import prisma from "../shared/prisma";
import AppError from "./AppError";

export type BranchContext = {
  branchIds: string[];
  branchAll: boolean;
  tenantId?: string | null;
};

export function resolveBranchContext(rawIds?: string[] | null): BranchContext {
  const ids = rawIds ?? [];
  if (ids.length === 0) return { branchIds: [], branchAll: true };
  return { branchIds: ids, branchAll: false };
}

export function getBranchWhere(ctx: BranchContext, requestedBranchId?: string | null) {
  if (!ctx.branchAll && ctx.branchIds.length === 1) {
    return { branchId: ctx.branchIds[0] as string };
  }
  if (requestedBranchId) {
    if (!ctx.branchAll && !ctx.branchIds.includes(requestedBranchId)) {
      throw new Error(`You are not assigned to branch ${requestedBranchId}`);
    }
    return { branchId: requestedBranchId };
  }
  if (ctx.branchAll) return {} as any;
  return { branchId: { in: ctx.branchIds } } as any;
}

export function assertBranchAccess(
  ctx: BranchContext,
  targetBranchId: string | null | undefined
) {
  if (!targetBranchId) return;
  if (ctx.branchAll) return;
  if (!ctx.branchIds.includes(targetBranchId)) {
    throw new Error("You do not have access to this branch");
  }
}

export async function assertRecordTenant(
  branchId: string | null | undefined,
  ctx?: { tenantId?: string | null } | null
) {
  if (!ctx?.tenantId || !branchId) return;
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { tenantId: true },
  });
  if (branch?.tenantId && branch.tenantId !== ctx.tenantId) {
    throw new AppError(404, "Record not found");
  }
}

export async function resolveCreateBranchId(
  payload: { branchId?: string | null; branch_id?: string | null } | null | undefined,
  ctx?: BranchContext | null
): Promise<string | null> {
  if (ctx && !ctx.branchAll && ctx.branchIds.length === 1) {
    return ctx.branchIds[0];
  }

  const requested = payload?.branchId || payload?.branch_id;
  if (!requested) {
    if (ctx?.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: ctx.tenantId },
        include: {
          defaultBranch: { select: { id: true, name: true, isActive: true } },
        },
      });
      const fallback = tenant?.defaultBranch;
      if (fallback) {
        if (!fallback.isActive) {
          throw new AppError(400, `Default branch "${fallback.name}" is archived`);
        }
        return fallback.id;
      }
    }
    if (ctx && (ctx.branchAll || ctx.branchIds.length > 1)) {
      throw new AppError(400, "branchId is required. Pick a branch from the selector.");
    }
    return null;
  }

  if (ctx && !ctx.branchAll && !ctx.branchIds.includes(requested)) {
    throw new AppError(403, "You are not assigned to that branch");
  }

  const branch = await prisma.branch.findUnique({ where: { id: requested } });
  if (!branch) throw new AppError(404, "Branch not found");
  if (!branch.isActive) throw new AppError(400, `Branch "${branch.name}" is archived`);
  if (ctx?.tenantId && branch.tenantId && branch.tenantId !== ctx.tenantId) {
    throw new AppError(403, "Branch belongs to a different clinic");
  }
  return requested;
}
