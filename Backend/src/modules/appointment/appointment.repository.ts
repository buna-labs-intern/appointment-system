import prisma from "../../shared/prisma";

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
        page: number,
        limit: number,
        search?: string,
        status?: string
    ) {
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.status = status;
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
                    doctor: {
                        fullName: {
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
                take: limit,
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
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
            data: appointments,
        };
    }

    async findConflict(
        doctorId: string,
        appointmentDate: Date,
        appointmentId?: string
    ) {
        return prisma.appointment.findFirst({
            where: {
                doctorId,
                date: appointmentDate,
                id: appointmentId
                    ? {
                        not: appointmentId,
                    }
                    : undefined,
                status: {
                    not: "CANCELLED",
                },
            },
        });
    }
}