// src/modules/service/service.service.ts
import ServiceRepository from "./service.repository";

export class ServiceService {
  // ✅ CREATE
  static async create(data: any) {
    // Check if service name already exists
    const existingService = await ServiceRepository.findByName(data.name);
    if (existingService) {
      throw new Error('Service name already exists');
    }

    return await ServiceRepository.create(data);
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
    await this.getById(id);
    return await ServiceRepository.activate(id);
  }

  // ✅ DEACTIVATE
  static async deactivate(id: string) {
    await this.getById(id);
    return await ServiceRepository.deactivate(id);
  }

  // ✅ DELETE
  static async delete(id: string) {
    await this.getById(id);
    return await ServiceRepository.delete(id);
  }
}