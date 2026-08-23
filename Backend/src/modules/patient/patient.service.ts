// src/modules/patient/patient.service.ts
import PatientRepository from "./patient.repository";
import NotificationService from "../notification/notification.service";

export class PatientService {
  static async create(data: any) {
    const existingPatient = await PatientRepository.findByPhone(data.phone);
    if (existingPatient) {
      throw new Error('Phone number already exists');
    }
    const created = await PatientRepository.create(data);

    NotificationService.createNotification({
      title: "New Patient Registered",
      message: `${created.fullName} was registered into the clinic system.`,
      type: "patient",
    });

    return created;
  }

  static async getAll(options: any) {
    return await PatientRepository.findAll(options);
  }

  static async getById(id: string) {
    const patient = await PatientRepository.findById(id);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return patient;
  }

  static async update(id: string, data: any) {
    await this.getById(id);
    if (data.phone) {
      const existingPatient = await PatientRepository.findByPhone(data.phone);
      if (existingPatient && existingPatient.id !== id) {
        throw new Error('Phone number already exists');
      }
    }
    return await PatientRepository.update(id, data);
  }

  static async delete(id: string) {
    await this.getById(id);
    return await PatientRepository.delete(id);
  }
}