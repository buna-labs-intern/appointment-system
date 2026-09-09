import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "../../shared/prisma";
import AppError from "../../utils/AppError";
import TenantRepository from "./tenant.repository";

type CreateTenantPayload = {
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  owner: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  };
};

type UpdateTenantPayload = {
  name?: string;
  slug?: string;
  address?: string | null;
  phone?: string | null;
  defaultBranchId?: string | null;
};

function assertBranchInTenant(branch: { id: string; tenantId: string | null } | null, tenantId: string) {
  if (!branch) throw new AppError(404, "Branch not found");
  if (branch.tenantId !== tenantId) throw new AppError(400, "Branch does not belong to this clinic");
}

export class TenantService {
  static async create(payload: CreateTenantPayload) {
    const slug = payload.slug
      ? payload.slug.trim().toLowerCase()
      : TenantRepository.slugify(payload.name);

    if (!slug) throw new AppError(400, "Could not derive a valid slug from the clinic name");

    const existing = await TenantRepository.findBySlug(slug);
    if (existing) throw new AppError(400, `A clinic with slug "${slug}" already exists`);

    const ownerEmail = payload.owner.email.trim().toLowerCase();
    const emailTaken = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (emailTaken) throw new AppError(400, "A user with this email already exists");

    const hashedPassword = await bcrypt.hash(payload.owner.password, 10);

    let tenantId = "";
    const tenant = await prisma.$transaction(async (tx) => {
      const created = await TenantRepository.create(tx, {
        name: payload.name.trim(),
        slug,
        address: payload.address,
        phone: payload.phone,
        isActive: true,
      });

      const mainBranch = await tx.branch.create({
        data: {
          name: "Main Branch",
          slug: `${slug}-main`,
          address: payload.address,
          phone: payload.phone,
          tenantId: created.id,
          isActive: true,
        },
      });

      tenantId = created.id;

      await tx.tenant.update({
        where: { id: created.id },
        data: { defaultBranchId: mainBranch.id },
      });

      const owner = await tx.user.create({
        data: {
          fullName: payload.owner.fullName.trim(),
          email: ownerEmail,
          phone: payload.owner.phone,
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
          mustChangePassword: true,
          tenantId: created.id,
          userBranches: { create: { branchId: mainBranch.id } },
        },
      });

      return { mainBranch, owner };
    });

    const fresh = await TenantRepository.findById(tenantId);
    if (!fresh) throw new AppError(500, "Clinic creation failed");

    return {
      tenant: fresh,
      mainBranch: tenant.mainBranch,
      owner: {
        id: tenant.owner.id,
        fullName: tenant.owner.fullName,
        email: tenant.owner.email,
        role: tenant.owner.role,
        mustChangePassword: true,
      },
    };
  }

  static async getAll(query: Record<string, any>) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const searchTerm = query.search || query.searchTerm || query.q;
    const isActive =
      query.isActive !== undefined && query.isActive !== ""
        ? query.isActive === "true"
        : undefined;
    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const { total, items } = await TenantRepository.findAll({
      page,
      limit,
      searchTerm,
      isActive,
      sortBy,
      sortOrder,
    });

    return {
      data: items,
      meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    };
  }

  static async getById(id: string) {
    const tenant = await TenantRepository.findById(id);
    if (!tenant) throw new AppError(404, "Clinic not found");
    return tenant;
  }

  static async listBranches(id: string) {
    const tenant = await TenantRepository.findById(id);
    if (!tenant) throw new AppError(404, "Clinic not found");
    return TenantRepository.listBranches(id);
  }

  static async update(id: string, payload: UpdateTenantPayload) {
    const tenant = await TenantRepository.findById(id);
    if (!tenant) throw new AppError(404, "Clinic not found");

    const data: Prisma.TenantUpdateInput = {};

    if (payload.name !== undefined) data.name = payload.name.trim();
    if (payload.slug !== undefined && payload.slug !== tenant.slug) {
      const clash = await TenantRepository.findBySlug(payload.slug);
      if (clash) throw new AppError(400, `A clinic with slug "${payload.slug}" already exists`);
      data.slug = payload.slug;
    }
    if (payload.address !== undefined) data.address = payload.address;
    if (payload.phone !== undefined) data.phone = payload.phone;

    if (payload.defaultBranchId !== undefined) {
      if (payload.defaultBranchId === null) {
        data.defaultBranch = { disconnect: true };
      } else {
        const branch = await prisma.branch.findUnique({
          where: { id: payload.defaultBranchId },
        });
        assertBranchInTenant(branch, id);
        data.defaultBranch = { connect: { id: payload.defaultBranchId } };
      }
    }

    return TenantRepository.update(id, data);
  }

  static async block(id: string, reason?: string) {
    const tenant = await TenantRepository.findById(id);
    if (!tenant) throw new AppError(404, "Clinic not found");
    if (!tenant.isActive) throw new AppError(400, "Clinic is already banned");
    return TenantRepository.block(id, reason);
  }

  static async unblock(id: string) {
    const tenant = await TenantRepository.findById(id);
    if (!tenant) throw new AppError(404, "Clinic not found");
    if (tenant.isActive) throw new AppError(400, "Clinic is not banned");
    return TenantRepository.unblock(id);
  }

  static async delete(id: string) {
    const tenant = await TenantRepository.findById(id);
    if (!tenant) throw new AppError(404, "Clinic not found");

    if (await TenantRepository.hasHistory(id)) {
      throw new AppError(
        400,
        "Clinic has branches, users or patients. Ban it instead of deleting."
      );
    }

    return TenantRepository.delete(id);
  }
}

export default TenantService;
