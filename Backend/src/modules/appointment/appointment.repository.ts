import prisma from "../../shared/prisma";
import { calculatePagination } from "../../utils";

export class AppointmentRepository {
  async create(data: any) {
    return prisma.appointment.create({
      data,
      include: {
        doctor: true,
        patient: true,
        service: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: true,
        patient: true,
        service: true,
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.appointment.update({
      where: { id },
      data,
      include: {
        doctor: true,
        patient: true,
        service: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.appointment.delete({
      where: { id },
    });
  }

  async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    doctorId?: string,
    patientId?: string,
    date?: string
  ) {
    const { skip, take } = calculatePagination(page, limit);
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (search) {
      where.OR = [
        {
          patient: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          patient: {
            phone: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          doctor: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          service: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take,
        orderBy: {
          date: "desc",
        },
        include: {
          doctor: true,
          patient: true,
          service: true,
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments,
      meta: {
        page: page || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / (take || 10)),
      },
    };
  }

  async findDoctorAppointmentsOnDate(doctorId: string, date: Date, excludeId?: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: "CANCELLED",
        },
        id: excludeId ? { not: excludeId } : undefined,
      },
      include: {
        service: true,
      },
    });
  }
}

export default new AppointmentRepository();