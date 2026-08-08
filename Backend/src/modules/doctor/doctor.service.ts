// src/modules/doctor/doctor.service.ts
import DoctorRepository from "./doctor.repository";

export class DoctorService {
  static async create(data: any) {
    // ✅ Validate required fields
    if (!data.fullName) throw new Error("fullName is required");
    if (!data.specialty) throw new Error("specialty is required");
    if (!data.phone) throw new Error("phone is required");

    return await DoctorRepository.create(data);
  }

  static async getAll() {
    return await DoctorRepository.findAll();
  }

  static async getById(id: string) {
    return await DoctorRepository.findById(id);
  }

  static async update(id: string, data: any) {
    return await DoctorRepository.update(id, data);
  }

  static async delete(id: string) {
    return await DoctorRepository.delete(id);
  }
}