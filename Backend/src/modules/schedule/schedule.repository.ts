import prisma from "../../shared/prisma";

const SESSION_TIMES: Record<string, { start: string; end: string }> = {
  MORNING: { start: "09:00", end: "12:00" },
  AFTERNOON: { start: "13:00", end: "17:00" },
};

function toDayStart(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }
  return d;
}

export class ScheduleRepository {
  async findAll(filters: { from?: string; to?: string; receptionistId?: string; branchId?: string; branchIds?: string[]; branchAll?: boolean; tenantId?: string | null }) {
    const where: Record<string, unknown> = {};

    if (filters.receptionistId) {
      where.receptionistId = filters.receptionistId;
    }

    if ((filters as any).branchId) {
      (where as any).branchId = (filters as any).branchId;
    } else if (!(filters as any).branchAll && (filters as any).branchIds?.length) {
      (where as any).branchId = { in: (filters as any).branchIds };
    } else if ((filters as any).tenantId) {
      (where as any).branch = { tenantId: (filters as any).tenantId };
    }

    if (filters.from || filters.to) {
      where.date = {
        ...(filters.from ? { gte: toDayStart(filters.from) } : {}),
        ...(filters.to ? { lte: toDayStart(filters.to) } : {}),
      };
    }

    return prisma.staffShift.findMany({
      where,
      include: {
        receptionist: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  async findById(id: string) {
    return prisma.staffShift.findUnique({
      where: { id },
      include: {
        receptionist: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async create(data: {
    receptionistId: string;
    date: string;
    session: "MORNING" | "AFTERNOON";
    location?: string;
    branchId?: string | null;
  }) {
    const times = SESSION_TIMES[data.session];
    return prisma.staffShift.create({
      data: {
        receptionistId: data.receptionistId,
        date: toDayStart(data.date),
        session: data.session,
        startTime: times.start,
        endTime: times.end,
        location: data.location?.trim() || "Front Desk",
        status: "SCHEDULED",
        branchId: (data as any).branchId || null,
      },
      include: {
        receptionist: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      receptionistId?: string;
      date?: string;
      session?: "MORNING" | "AFTERNOON";
      location?: string;
      status?: string;
    },
  ) {
    const updateData: Record<string, unknown> = {};

    if (data.receptionistId) updateData.receptionistId = data.receptionistId;
    if (data.date) updateData.date = toDayStart(data.date);
    if (data.session) {
      updateData.session = data.session;
      updateData.startTime = SESSION_TIMES[data.session].start;
      updateData.endTime = SESSION_TIMES[data.session].end;
    }
    if (data.location) updateData.location = data.location.trim();
    if (data.status) updateData.status = data.status;

    return prisma.staffShift.update({
      where: { id },
      data: updateData,
      include: {
        receptionist: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.staffShift.delete({ where: { id } });
  }

  async findDuplicate(receptionistId: string, date: string, session: string, branchId?: string | null, excludeId?: string) {
    return prisma.staffShift.findFirst({
      where: {
        receptionistId,
        branchId: branchId || undefined,
        date: toDayStart(date),
        session,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      } as any,
    });
  }
}
