// src/modules/service/service.controller.ts
import { Request, Response } from "express";
import { ServiceService } from "./service.service";

export class ServiceController {
  static async create(req: Request, res: Response) {
    try {
      const service = await ServiceService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Service created successfully",
        data: service,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create service",
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        searchTerm: (req.query.searchTerm || req.query.search || req.query.q) as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        isActive: req.query.isActive === 'true' ? true : 
                  req.query.isActive === 'false' ? false : undefined,
      };

      const result = await ServiceService.getAll(options);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch services",
      });
    }
  }

  // ✅ GET BY ID - FIXED
  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await ServiceService.getById(id as string);
      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error: any) {
      res.status(error.message === 'Service not found' ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to fetch service",
      });
    }
  }

  // ✅ UPDATE - FIXED
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await ServiceService.update(id as string, req.body);
      res.status(200).json({
        success: true,
        message: "Service updated successfully",
        data: service,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update service",
      });
    }
  }

  // ✅ ACTIVATE - FIXED
  static async activate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await ServiceService.activate(id as string);
      res.status(200).json({
        success: true,
        message: "Service activated successfully",
        data: service,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to activate service",
      });
    }
  }

  // ✅ DEACTIVATE - FIXED
  static async deactivate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await ServiceService.deactivate(id as string);
      res.status(200).json({
        success: true,
        message: "Service deactivated successfully",
        data: service,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to deactivate service",
      });
    }
  }

  // ✅ DELETE - FIXED
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ServiceService.delete(id as string);
      res.status(200).json({
        success: true,
        message: "Service deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete service",
      });
    }
  }
}