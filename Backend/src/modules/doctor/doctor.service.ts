import DoctorRepository from "./doctor.repository";
import AppError from "../../utils/AppError";

export class DoctorService {
  static async create(data: any) {
    if (!data.fullName) throw new AppError(400, "Full name is required");
    if (!data.specialty) throw new AppError(400, "Specialty is required");
    if (!data.phone) throw new AppError(400, "Phone number is required");

    return DoctorRepository.create(data);
  }

  static async getAll(query?: any) {
    if (!query || Object.keys(query).length === 0) {
      return DoctorRepository.findAll();
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const searchTerm = query.search || query.searchTerm || query.q;
    const isActive =
      query.isActive !== undefined
        ? query.isActive === "true" || query.isActive === true
        : undefined;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    return DoctorRepository.findAll({
      page,
      limit,
      searchTerm,
      isActive,
      sortBy,
      sortOrder,
    });
  }

  static async getById(id: string) {
    const doctor = await DoctorRepository.findById(id);
    if (!doctor) {
      throw new AppError(404, "Doctor not found");
    }
    return doctor;
  }

  static async update(id: string, data: any) {
    const existing = await DoctorRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Doctor not found");
    }
    return DoctorRepository.update(id, data);
  }

  static async activate(id: string) {
    const existing = await DoctorRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Doctor not found");
    }
    return DoctorRepository.update(id, { isActive: true });
  }

  static async deactivate(id: string) {
    const existing = await DoctorRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Doctor not found");
    }
    return DoctorRepository.update(id, { isActive: false });
  }

  static async delete(id: string) {
    const existing = await DoctorRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Doctor not found");
    }
    return DoctorRepository.delete(id);
  }
}