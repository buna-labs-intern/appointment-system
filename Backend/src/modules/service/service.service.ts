// src/modules/service/service.service.ts
import ServiceRepository from "./service.repository";
import NotificationService from "../notification/notification.service";
import prisma from "../../shared/prisma";
import { resolveCreateBranchId, assertRecordTenant } from "../../utils/branchScope";

export class ServiceService {
  // ✅ CREATE
  static async resolveBranchId(payload: any, ctx: any) {
    return resolveCreateBranchId(payload, ctx);
  }

  static async create(data: any, ctx?: any) {
    const branchId = ctx !== undefined ? await this.resolveBranchId(data, ctx) : data.branchId || null;
    // Check if service name already exists
    const existingService = await ServiceRepository.findByName(data.name, branchId);
    if (existingService) {
      throw new Error('Service name already exists in this branch');
    }

    const created = await ServiceRepository.create({ ...data, branchId });
    NotificationService.createNotification({
      title: "New Service Added",
      message: `Service "${(created as any).name}" has been added.`,
      type: "system",
      branchId: (created as any).branchId,
    } as any);

    return created;
  }

  // ✅ GET ALL WITH PAGINATION, SEARCH, FILTER
  static async getAll(options: any) {
    return await ServiceRepository.findAll(options);
  }

  // ✅ GET BY ID
  static async getById(id: string, ctx?: { tenantId?: string | null } | null) {
    const service = await ServiceRepository.findById(id);
    if (!service) {
      throw new Error('Service not found');
    }
    await assertRecordTenant((service as any).branchId, ctx);
    return service;
  }

  // ✅ UPDATE
  static async update(id: string, data: any, ctx?: { tenantId?: string | null } | null) {
    // Check if service exists
    await this.getById(id, ctx);

    // Check if name is being changed and already exists
    if (data.name) {
      const existingService = await ServiceRepository.findByName(data.name);
      if (existingService && existingService.id !== id) {
        throw new Error('Service name already exists');
      }
    }

    return await ServiceRepository.update(id, data);
  }

  // ✅ ACTIVATE
  static async activate(id: string, ctx?: { tenantId?: string | null } | null) {
    const service = await this.getById(id, ctx);
    const updated = await ServiceRepository.activate(id);
    NotificationService.createNotification({
      title: "Service Activated",
      message: `Service "${service.name}" is now active and available for booking.`,
      type: "system",
    });
    return updated;
  }

  // ✅ DEACTIVATE
  static async deactivate(id: string, ctx?: { tenantId?: string | null } | null) {
    const service = await this.getById(id, ctx);
    const updated = await ServiceRepository.deactivate(id);
    NotificationService.createNotification({
      title: "Service Deactivated",
      message: `Service "${service.name}" was marked inactive and cannot be booked.`,
      type: "system",
    });
    return updated;
  }

  // ✅ DELETE
  static async delete(id: string, ctx?: { tenantId?: string | null } | null) {
    await this.getById(id, ctx);
    return await ServiceRepository.delete(id);
  }
}