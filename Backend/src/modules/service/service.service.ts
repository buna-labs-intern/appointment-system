// src/modules/service/service.service.ts
import ServiceRepository from "./service.repository";
import NotificationService from "../notification/notification.service";

export class ServiceService {
  // ✅ CREATE
  static async create(data: any) {
    // Check if service name already exists
    const existingService = await ServiceRepository.findByName(data.name);
    if (existingService) {
      throw new Error('Service name already exists');
    }

    const created = await ServiceRepository.create(data);
    NotificationService.createNotification({
      title: "New Service Added",
      message: `Service "${created.name}" has been added to the clinic.`,
      type: "system",
    });

    return created;
  }

  // ✅ GET ALL WITH PAGINATION, SEARCH, FILTER
  static async getAll(options: any) {
    return await ServiceRepository.findAll(options);
  }

  // ✅ GET BY ID
  static async getById(id: string) {
    const service = await ServiceRepository.findById(id);
    if (!service) {
      throw new Error('Service not found');
    }
    return service;
  }

  // ✅ UPDATE
  static async update(id: string, data: any) {
    // Check if service exists
    await this.getById(id);

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
  static async activate(id: string) {
    const service = await this.getById(id);
    const updated = await ServiceRepository.activate(id);
    NotificationService.createNotification({
      title: "Service Activated",
      message: `Service "${service.name}" is now active and available for booking.`,
      type: "system",
    });
    return updated;
  }

  // ✅ DEACTIVATE
  static async deactivate(id: string) {
    const service = await this.getById(id);
    const updated = await ServiceRepository.deactivate(id);
    NotificationService.createNotification({
      title: "Service Deactivated",
      message: `Service "${service.name}" was marked inactive and cannot be booked.`,
      type: "system",
    });
    return updated;
  }

  // ✅ DELETE
  static async delete(id: string) {
    await this.getById(id);
    return await ServiceRepository.delete(id);
  }
}