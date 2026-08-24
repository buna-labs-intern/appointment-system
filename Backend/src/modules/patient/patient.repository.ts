import prisma from "../../shared/prisma";
import { SearchOptions } from "../../shared/Types";
import { calculatePagination, generateSearchCondition } from "../../utils";

export class PatientRepository {
  async create(data: any) {
    const rawBirthDate = data.birthDate || data.dateOfBirth;
    return prisma.patient.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        gender: data.gender,
        birthDate: rawBirthDate ? new Date(rawBirthDate) : new Date(),
        address: data.address || null,
        notes: data.notes || null,
      },
    });
  }

  async findAll(options?: SearchOptions & { gender?: string }) {
    if (!options) {
      return prisma.patient.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    const { page, limit, sortBy, sortOrder, searchTerm, gender } = options;
    const { skip, take } = calculatePagination(page, limit);

    const searchCondition = generateSearchCondition(searchTerm, ["fullName", "phone", "address"]);
    const filterCondition: any = {};
    if (gender) filterCondition.gender = gender;

    const where = {
      ...searchCondition,
      ...filterCondition,
    };

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || "asc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [data, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      prisma.patient.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: page || 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / (take || 10)),
      },
    };
  }

  async findById(id: string) {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            doctor: true,
            service: true,
          },
        },
      },
    });
  }

  async findByPhone(phone: string) {
    return prisma.patient.findFirst({
      where: { phone },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.birthDate || data.dateOfBirth) {
      updateData.birthDate = new Date(data.birthDate || data.dateOfBirth);
    }
    if (data.address !== undefined) updateData.address = data.address;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return prisma.patient.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await prisma.appointment.deleteMany({
      where: { patientId: id },
    });
    return prisma.patient.delete({
      where: { id },
    });
  }
}

export default new PatientRepository();