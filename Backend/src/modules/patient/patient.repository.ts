// src/modules/patient/patient.repository.ts
import prisma from "../../shared/prisma";
import { SearchOptions } from "../../shared/types";
// ✅ Import from root utils folder (NOT shared/utils)
import { calculatePagination, generateSearchCondition } from "../../utils";

export class PatientRepository {
  async create(data: any) {
    return await prisma.patient.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        gender: data.gender,
        birthDate: new Date(data.birthDate),
      },
    });
  }

  async findAll(options: SearchOptions & { gender?: string }) {
    const { page, limit, sortBy, sortOrder, searchTerm, gender } = options;
    const { skip, take } = calculatePagination(page, limit);

    const searchCondition = generateSearchCondition(searchTerm, ['fullName', 'phone']);
    const filterCondition: any = {};
    if (gender) filterCondition.gender = gender;

    const where = {
      ...searchCondition,
      ...filterCondition,
    };

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
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
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return await prisma.patient.findUnique({
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
    return await prisma.patient.findFirst({
      where: { phone },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {
      fullName: data.fullName,
      phone: data.phone,
      gender: data.gender,
    };
    
    if (data.birthDate) {
      updateData.birthDate = new Date(data.birthDate);
    }

    return await prisma.patient.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return await prisma.patient.delete({
      where: { id },
    });
  }
}

export default new PatientRepository();