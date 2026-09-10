import prisma from "../../shared/prisma";

export class DashboardRepository {
  async getStatistics(branchId?: string, ctx?: any) {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Branch scoping helpers
    const branchFilter = (field: string = "branchId") => {
      if (branchId) return { [field]: branchId } as any;
      if (ctx && !ctx.branchAll && ctx.branchIds?.length) return { [field]: { in: ctx.branchIds } } as any;
      if (ctx?.tenantId) return { branch: { tenantId: ctx.tenantId } } as any;
      return {} as any;
    };

    const [
      totalDoctors,
      totalPatients,
      todayAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments,
      recentAppointments,
    ] = await Promise.all([
      prisma.doctor.count({
        where: {
          isActive: true,
          ...branchFilter(),
        },
      }),

      prisma.patient.count({
        where: ctx?.tenantId ? { tenantId: ctx.tenantId } : {},
      }),

      prisma.appointment.count({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          ...branchFilter(),
        },
      }),

      prisma.appointment.count({
        where: {
          status: "SCHEDULED",
          ...branchFilter(),
        },
      }),

      prisma.appointment.count({
        where: {
          status: "COMPLETED",
          ...branchFilter(),
        },
      }),

      prisma.appointment.count({
        where: {
          status: "CANCELLED",
          ...branchFilter(),
        },
      }),

      prisma.appointment.findMany({
        where: branchFilter(),
        orderBy: {
          date: "desc",
        },
        take: 10,
        include: {
          doctor: true,
          patient: true,
          service: true,
          branch: { select: { id: true, name: true, slug: true } } as any,
        },
      }),
    ]);

    return {
      totalDoctors,
      totalPatients,
      todayAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments,
      recentAppointments,
    };
  }
}