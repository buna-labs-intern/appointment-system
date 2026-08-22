import AppError from "../../utils/AppError";
import prisma from "../../shared/prisma";
import { AppointmentRepository } from "./appointment.repository";

export class AppointmentService {
    private repository = new AppointmentRepository();

    private validateWorkingHours(date: Date) {
        const hour = date.getHours();
        const minute = date.getMinutes();

        const totalMinutes = hour * 60 + minute;

        const clinicStart = 8 * 60;
        const clinicEnd = 17 * 60;

        const lunchStart = 12 * 60;
        const lunchEnd = 13 * 60;

        if (totalMinutes < clinicStart || totalMinutes > clinicEnd) {
            throw new AppError(
                400,
                "Appointment must be within clinic working hours"
            );
        }

        if (totalMinutes >= lunchStart && totalMinutes < lunchEnd) {
            throw new AppError(
                400,
                "Appointment cannot be scheduled during lunch break"
            );
        }
    }

    async create(payload: any) {
        const appointmentDate = new Date(payload.date);

        if (appointmentDate < new Date()) {
            throw new AppError(
                400,
                "Cannot create appointment in the past"
            );
        }

        this.validateWorkingHours(appointmentDate);

        const doctor = await prisma.doctor.findUnique({
            where: {
                id: payload.doctorId,
            },
        });

        if (!doctor) {
            throw new AppError(404, "Doctor not found");
        }

        if (!doctor.isActive) {
            throw new AppError(400, "Doctor is inactive");
        }

        const service = await prisma.service.findUnique({
            where: {
                id: payload.serviceId,
            },
        });

        if (!service) {
            throw new AppError(404, "Service not found");
        }

        if (!service.isActive) {
            throw new AppError(400, "Service is inactive");
        }

        const patient = await prisma.patient.findUnique({
            where: {
                id: payload.patientId,
            },
        });

        if (!patient) {
            throw new AppError(404, "Patient not found");
        }

        const conflict =
            await this.repository.findConflict(
                payload.doctorId,
                appointmentDate
            );

        if (conflict) {
            throw new AppError(
                400,
                "Doctor already has appointment at this time"
            );
        }

        return this.repository.create({
            ...payload,
            date: appointmentDate,
            status: "SCHEDULED",
        });
    }

    async getById(id: string) {
        const appointment =
            await this.repository.findById(id);

        if (!appointment) {
            throw new AppError(
                404,
                "Appointment not found"
            );
        }

        return appointment;
    }

    async getAll(query: any) {
        return this.repository.getAll(
            Number(query.page) || 1,
            Number(query.limit) || 10,
            query.search,
            query.status
        );
    }

    async update(id: string, payload: any) {
        const appointment =
            await this.repository.findById(id);

        if (!appointment) {
            throw new AppError(
                404,
                "Appointment not found"
            );
        }

        if (appointment.status === "COMPLETED") {
            throw new AppError(
                400,
                "Completed appointments are read only"
            );
        }

        if (payload.date) {
            const date = new Date(payload.date);

            this.validateWorkingHours(date);

            const conflict =
                await this.repository.findConflict(
                    payload.doctorId || appointment.doctorId,
                    date,
                    id
                );

            if (conflict) {
                throw new AppError(
                    400,
                    "Doctor already booked"
                );
            }
        }

        const updateData: Record<string, unknown> = {};

        if (payload.doctorId) updateData.doctorId = payload.doctorId;
        if (payload.patientId) updateData.patientId = payload.patientId;
        if (payload.serviceId) updateData.serviceId = payload.serviceId;
        if (payload.status) updateData.status = payload.status;
        if (payload.date) updateData.date = new Date(payload.date);

        return this.repository.update(id, updateData);
    }

    async cancel(id: string) {
        return this.repository.update(id, {
            status: "CANCELLED",
        });
    }

    async checkIn(id: string) {
        return this.repository.update(id, {
            status: "CHECKED_IN",
        });
    }

    async complete(id: string) {
        return this.repository.update(id, {
            status: "COMPLETED",
        });
    }

    async noShow(id: string) {
        return this.repository.update(id, {
            status: "NO_SHOW",
        });
    }

    async delete(id: string) {
        const appointment =
            await this.repository.findById(id);

        if (!appointment) {
            throw new AppError(
                404,
                "Appointment not found"
            );
        }

        return this.repository.delete(id);
    }
}