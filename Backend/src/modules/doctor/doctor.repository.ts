// src/modules/doctor/doctor.repository.ts
import prisma from "../../shared/prisma";

export class DoctorRepository {
  // ✅ Create doctor with correct field names
  async create(data: any) {
    try {
      console.log("📥 Repository received:", data);
      
      return await prisma.doctor.create({
        data: {
          fullName: data.fullName,
          specialty: data.specialty,
          phone: data.phone,
          // isActive defaults to true, no need to include
        },
      });
    } catch (error) {
      console.error("❌ Repository error:", error);
      throw error;
    }
  }

  // ✅ Get all doctors
  async findAll() {
    return await prisma.doctor.findMany();
  }

  // ✅ Get doctor by ID
  async findById(id: string) {
    return await prisma.doctor.findUnique({
      where: { id },
      include: {
        appointments: true,
      },
    });
  }

  // ✅ Update doctor
  async update(id: string, data: any) {
    return await prisma.doctor.update({
      where: { id },
      data: {
        fullName: data.fullName,
        specialty: data.specialty,
        phone: data.phone,
        isActive: data.isActive,
      },
    });
  }

  // ✅ Delete doctor
  async delete(id: string) {
    return await prisma.doctor.delete({
      where: { id },
    });
  }
}

export default new DoctorRepository();