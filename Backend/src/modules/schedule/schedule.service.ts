import AppError from "../../utils/AppError";
import prisma from "../../shared/prisma";
import { ScheduleRepository } from "./schedule.repository";
import { resolveCreateBranchId, assertRecordTenant } from "../../utils/branchScope";

const repository = new ScheduleRepository();

export class ScheduleService {
  static async getAll(query: { from?: string; to?: string; receptionistId?: string; branchId?: string }, ctx?: any) {
    const effective: any = { ...query };
    if (ctx && !ctx.branchAll && ctx.branchIds.length === 1) effective.branchId = ctx.branchIds[0];
    else if (query.branchId) {
      if (ctx && !ctx.branchAll && !ctx.branchIds.includes(query.branchId)) throw new AppError(403, "You are not assigned to that branch");
      effective.branchId = query.branchId;
    } else if (ctx && !ctx.branchAll && ctx.branchIds.length > 1) {
      effective.branchIds = ctx.branchIds;
      effective.branchAll = false;
    } else if (ctx?.tenantId) {
      effective.tenantId = ctx.tenantId;
    }
    return repository.findAll(effective);
  }

  static async getById(id: string) {
    const shift = await repository.findById(id);
    if (!shift) throw new AppError(404, "Shift not found");
    return shift;
  }

  static async resolveBranch(data: any, ctx?: any) {
    return resolveCreateBranchId(data, ctx);
  }

  static async create(data: {
    receptionistId: string;
    date: string;
    session: "MORNING" | "AFTERNOON";
    location?: string;
    branchId?: string;
  }, ctx?: any) {
    const branchId = await this.resolveBranch(data, ctx);
    const user = await prisma.user.findUnique({ where: { id: data.receptionistId } });
    if (!user) throw new AppError(404, "Receptionist not found");
    if (!user.isActive) throw new AppError(400, "Cannot assign a shift to an inactive account");
    if (user.role !== "RECEPTIONIST" && user.role !== "ADMIN") {
      throw new AppError(400, "Shifts can only be assigned to staff accounts");
    }

    const day = new Date(`${data.date}T00:00:00.000Z`);
    const weekday = day.getUTCDay();
    if (weekday === 0 || weekday === 6) {
      throw new AppError(400, "Staff shifts are only scheduled on weekdays");
    }

    const duplicate = await repository.findDuplicate(
      data.receptionistId,
      data.date,
      data.session,
      branchId || undefined,
    );
    if (duplicate) {
      throw new AppError(
        400,
        `${user.fullName} already has a ${data.session.toLowerCase()} shift on this date`,
      );
    }

    return repository.create({ ...data, branchId });
  }

  static async update(
    id: string,
    data: {
      receptionistId?: string;
      date?: string;
      session?: "MORNING" | "AFTERNOON";
      location?: string;
      status?: string;
    },
    ctx?: any,
  ) {
    const existing = await repository.findById(id);
    if (!existing) throw new AppError(404, "Shift not found");
    await assertRecordTenant((existing as any).branchId, ctx);

    const receptionistId = data.receptionistId || existing.receptionistId;
    const date =
      data.date ||
      existing.date.toISOString().slice(0, 10);
    const session = (data.session || existing.session) as "MORNING" | "AFTERNOON";

    if (data.receptionistId) {
      const user = await prisma.user.findUnique({ where: { id: data.receptionistId } });
      if (!user) throw new AppError(404, "Receptionist not found");
      if (!user.isActive) throw new AppError(400, "Cannot assign a shift to an inactive account");
    }

    if (data.date) {
      const day = new Date(`${data.date}T00:00:00.000Z`);
      const weekday = day.getUTCDay();
      if (weekday === 0 || weekday === 6) {
        throw new AppError(400, "Staff shifts are only scheduled on weekdays");
      }
    }

    const duplicate = await repository.findDuplicate(receptionistId, date, session, (existing as any).branchId || undefined, id);
    if (duplicate) {
      throw new AppError(400, "That staff member already has this session on the selected date");
    }

    return repository.update(id, data);
  }

  static async delete(id: string, ctx?: any) {
    const existing = await repository.findById(id);
    if (!existing) throw new AppError(404, "Shift not found");
    await assertRecordTenant((existing as any).branchId, ctx);
    await repository.delete(id);
    return { message: "Shift deleted successfully" };
  }
}
