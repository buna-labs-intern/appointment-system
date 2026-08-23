import AppError from "../../utils/AppError";
import prisma from "../../shared/prisma";
import AppointmentRepository from "./appointment.repository";
import NotificationService from "../notification/notification.service";

export class AppointmentService {
  private static parseTimeToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }

  private static formatMinutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  private static validateOperatingHours(startMinutes: number, endMinutes: number) {
    const morningStart = 9 * 60;   // 09:00 (540 mins)
    const morningEnd = 12 * 60;     // 12:00 (720 mins)
    const afternoonStart = 13 * 60; // 13:00 (780 mins)
    const afternoonEnd = 17 * 60;   // 17:00 (1020 mins)
    const lunchStart = 12 * 60;     // 12:00
    const lunchEnd = 13 * 60;       // 13:00

    if (endMinutes <= startMinutes) {
      throw new AppError(400, "Appointment end time must be later than start time");
    }

    // Check if within morning session (09:00 - 12:00)
    const isMorning = startMinutes >= morningStart && endMinutes <= morningEnd;
    // Check if within afternoon session (01:00 - 05:00)
    const isAfternoon = startMinutes >= afternoonStart && endMinutes <= afternoonEnd;

    if (!isMorning && !isAfternoon) {
      if (startMinutes < lunchEnd && endMinutes > lunchStart) {
        throw new AppError(
          400,
          "Appointments cannot overlap the lunch break (12:00 PM – 01:00 PM)"
        );
      }
      throw new AppError(
        400,
        "Appointments must be scheduled during clinic operating hours (09:00 AM – 12:00 PM or 01:00 PM – 05:00 PM)"
      );
    }
  }

  private static async checkDoctorOverlap(
    doctorId: string,
    appointmentDate: Date,
    startMinutes: number,
    endMinutes: number,
    excludeId?: string
  ) {
    const existingAppointments = await AppointmentRepository.findDoctorAppointmentsOnDate(
      doctorId,
      appointmentDate,
      excludeId
    );

    for (const appt of existingAppointments) {
      let existingStartMinutes: number;
      let existingEndMinutes: number;

      if (appt.startTime && appt.endTime) {
        existingStartMinutes = this.parseTimeToMinutes(appt.startTime);
        existingEndMinutes = this.parseTimeToMinutes(appt.endTime);
      } else {
        const apptDate = new Date(appt.date);
        existingStartMinutes = apptDate.getHours() * 60 + apptDate.getMinutes();
        const duration = appt.service?.duration || 30;
        existingEndMinutes = existingStartMinutes + duration;
      }

      // Check overlap: (start1 < end2 && end1 > start2)
      if (startMinutes < existingEndMinutes && endMinutes > existingStartMinutes) {
        throw new AppError(
          400,
          `Doctor already has an appointment scheduled from ${this.formatMinutesToTime(
            existingStartMinutes
          )} to ${this.formatMinutesToTime(existingEndMinutes)}`
        );
      }
    }
  }

  static async create(payload: any) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: payload.doctorId },
    });
    if (!doctor) {
      throw new AppError(404, "Doctor not found");
    }
    if (!doctor.isActive) {
      throw new AppError(400, "Cannot schedule appointment with an inactive doctor");
    }

    const service = await prisma.service.findUnique({
      where: { id: payload.serviceId },
    });
    if (!service) {
      throw new AppError(404, "Service not found");
    }
    if (!service.isActive) {
      throw new AppError(400, "Cannot schedule appointment with an inactive service");
    }

    const patient = await prisma.patient.findUnique({
      where: { id: payload.patientId },
    });
    if (!patient) {
      throw new AppError(404, "Patient not found");
    }

    const baseDate = new Date(payload.date);
    let startMinutes: number;
    let endMinutes: number;
    let startTimeStr = payload.startTime;
    let endTimeStr = payload.endTime;

    if (startTimeStr && endTimeStr) {
      startMinutes = this.parseTimeToMinutes(startTimeStr);
      endMinutes = this.parseTimeToMinutes(endTimeStr);
    } else if (startTimeStr) {
      startMinutes = this.parseTimeToMinutes(startTimeStr);
      endMinutes = startMinutes + (service.duration || 30);
      endTimeStr = this.formatMinutesToTime(endMinutes);
    } else {
      startMinutes = baseDate.getHours() * 60 + baseDate.getMinutes();
      endMinutes = startMinutes + (service.duration || 30);
      startTimeStr = this.formatMinutesToTime(startMinutes);
      endTimeStr = this.formatMinutesToTime(endMinutes);
    }

    // Validate operating hours & lunch break
    this.validateOperatingHours(startMinutes, endMinutes);

    // Build complete appointment start DateTime
    const fullStartDateTime = new Date(baseDate);
    fullStartDateTime.setHours(
      Math.floor(startMinutes / 60),
      startMinutes % 60,
      0,
      0
    );

    // Past appointment validation (allow 2 min grace period for request transmission)
    const now = new Date(Date.now() - 2 * 60 * 1000);
    if (fullStartDateTime < now) {
      throw new AppError(400, "Appointments cannot be created in the past");
    }

    // Check doctor overlapping appointments
    await this.checkDoctorOverlap(payload.doctorId, fullStartDateTime, startMinutes, endMinutes);

    const created = await AppointmentRepository.create({
      doctorId: payload.doctorId,
      patientId: payload.patientId,
      serviceId: payload.serviceId,
      date: fullStartDateTime,
      startTime: startTimeStr,
      endTime: endTimeStr,
      reason: payload.reason?.trim() || null,
      notes: payload.notes?.trim() || null,
      status: payload.status || "SCHEDULED",
    });

    // Automated Notification
    NotificationService.createNotification({
      title: "New Appointment Scheduled",
      message: `${patient.fullName} scheduled with Dr. ${doctor.fullName} on ${fullStartDateTime.toISOString().split("T")[0]} at ${startTimeStr}`,
      type: "appointment",
    });

    return created;
  }

  static async getById(id: string) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) {
      throw new AppError(404, "Appointment not found");
    }
    return appointment;
  }

  static async getAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search || query.searchTerm;
    const status = query.status;
    const doctorId = query.doctorId;
    const patientId = query.patientId;
    const date = query.date;

    return AppointmentRepository.getAll(
      page,
      limit,
      search,
      status,
      doctorId,
      patientId,
      date
    );
  }

  static async update(id: string, payload: any) {
    const existing = await AppointmentRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Appointment not found");
    }

    if (existing.status === "COMPLETED") {
      throw new AppError(400, "Completed appointments are read-only and cannot be modified");
    }

    const doctorId = payload.doctorId || existing.doctorId;
    const serviceId = payload.serviceId || existing.serviceId;
    const service = await prisma.service.findUnique({ where: { id: serviceId } });

    const baseDate = payload.date ? new Date(payload.date) : new Date(existing.date);
    let startTimeStr = payload.startTime || existing.startTime || this.formatMinutesToTime(baseDate.getHours() * 60 + baseDate.getMinutes());
    let endTimeStr = payload.endTime || existing.endTime || this.formatMinutesToTime(this.parseTimeToMinutes(startTimeStr) + (service?.duration || 30));

    const startMinutes = this.parseTimeToMinutes(startTimeStr);
    const endMinutes = this.parseTimeToMinutes(endTimeStr);

    if (payload.date || payload.startTime || payload.endTime) {
      this.validateOperatingHours(startMinutes, endMinutes);
      await this.checkDoctorOverlap(doctorId, baseDate, startMinutes, endMinutes, id);
    }

    const updateData: any = {};
    if (payload.doctorId) updateData.doctorId = payload.doctorId;
    if (payload.patientId) updateData.patientId = payload.patientId;
    if (payload.serviceId) updateData.serviceId = payload.serviceId;
    if (payload.date) {
      const fullDate = new Date(payload.date);
      fullDate.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
      updateData.date = fullDate;
    }
    if (payload.startTime) updateData.startTime = startTimeStr;
    if (payload.endTime) updateData.endTime = endTimeStr;
    if (payload.reason !== undefined) updateData.reason = payload.reason?.trim() || null;
    if (payload.notes !== undefined) updateData.notes = payload.notes?.trim() || null;
    if (payload.status) updateData.status = payload.status;

    return AppointmentRepository.update(id, updateData);
  }

  static async cancel(id: string) {
    const existing = await AppointmentRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Appointment not found");
    }
    if (existing.status === "COMPLETED") {
      throw new AppError(400, "Completed appointments cannot be cancelled");
    }
    const updated = await AppointmentRepository.update(id, { status: "CANCELLED" });

    NotificationService.createNotification({
      title: "Appointment Cancelled",
      message: `Appointment for ${existing.patient?.fullName || "Patient"} with Dr. ${existing.doctor?.fullName || "Doctor"} was cancelled.`,
      type: "appointment",
    });

    return updated;
  }

  static async checkIn(id: string) {
    const existing = await AppointmentRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Appointment not found");
    }
    if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
      throw new AppError(400, `Cannot check in an appointment with status ${existing.status}`);
    }
    const updated = await AppointmentRepository.update(id, { status: "CHECKED_IN" });

    NotificationService.createNotification({
      title: "Patient Checked In",
      message: `${existing.patient?.fullName || "Patient"} has checked in for appointment with Dr. ${existing.doctor?.fullName || "Doctor"}.`,
      type: "appointment",
    });

    return updated;
  }

  static async complete(id: string) {
    const existing = await AppointmentRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Appointment not found");
    }
    if (existing.status === "CANCELLED") {
      throw new AppError(400, "Cannot complete a cancelled appointment");
    }
    return AppointmentRepository.update(id, { status: "COMPLETED" });
  }

  static async noShow(id: string) {
    const existing = await AppointmentRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Appointment not found");
    }
    if (existing.status === "COMPLETED") {
      throw new AppError(400, "Cannot mark a completed appointment as no-show");
    }
    const updated = await AppointmentRepository.update(id, { status: "NO_SHOW" });

    NotificationService.createNotification({
      title: "Appointment No-Show",
      message: `${existing.patient?.fullName || "Patient"} missed scheduled appointment with Dr. ${existing.doctor?.fullName || "Doctor"}.`,
      type: "alert",
    });

    return updated;
  }

  static async delete(id: string) {
    const existing = await AppointmentRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Appointment not found");
    }
    return AppointmentRepository.delete(id);
  }
}