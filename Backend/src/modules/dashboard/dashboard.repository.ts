import prisma from "../../shared/prisma";

export class DashboardRepository {
  async getStatistics() {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

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
        },
      }),

      prisma.patient.count(),

      prisma.appointment.count({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),

      prisma.appointment.count({
        where: {
          status: "SCHEDULED",
        },
      }),

      prisma.appointment.count({
        where: {
          status: "COMPLETED",
        },
      }),

      prisma.appointment.count({
        where: {
          status: "CANCELLED",
        },
      }),

      prisma.appointment.findMany({
        orderBy: {
          date: "desc",
        },
        take: 10,
        include: {
          doctor: true,
          patient: true,
          service: true,
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