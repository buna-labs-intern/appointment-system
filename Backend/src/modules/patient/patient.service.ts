// src/modules/patient/patient.service.ts
import PatientRepository from "./patient.repository";
import NotificationService from "../notification/notification.service";

export class PatientService {
  static async create(data: any, ctx?: { tenantId?: string | null } | null) {
    const existingPatient = await PatientRepository.findByPhone(data.phone, ctx?.tenantId);
    if (existingPatient) {
      throw new Error('Phone number already exists');
    }
    const created = await PatientRepository.create({ ...data, tenantId: ctx?.tenantId ?? data.tenantId ?? null });

    NotificationService.createNotification({
      title: "New Patient Registered",
      message: `${created.fullName} was registered into the clinic system.`,
      type: "patient",
    });

    return created;
  }

  static async getAll(options: any, ctx?: { tenantId?: string | null } | null) {
    return await PatientRepository.findAll({ ...options, tenantId: ctx?.tenantId });
  }

  static async getById(id: string, ctx?: { tenantId?: string | null } | null) {
    const patient = await PatientRepository.findById(id);
    if (!patient) {
      throw new Error('Patient not found');
    }
    if (ctx?.tenantId && patient.tenantId && patient.tenantId !== ctx.tenantId) {
      throw new Error('Patient not found');
    }
    return patient;
  }

  static async update(id: string, data: any, ctx?: { tenantId?: string | null } | null) {
    await this.getById(id, ctx);
    if (data.phone) {
      const existingPatient = await PatientRepository.findByPhone(data.phone, ctx?.tenantId);
      if (existingPatient && existingPatient.id !== id) {
        throw new Error('Phone number already exists');
      }
    }
    return await PatientRepository.update(id, data);
  }

  static async delete(id: string, ctx?: { tenantId?: string | null } | null) {
    await this.getById(id, ctx);
    return await PatientRepository.delete(id);
  }
}