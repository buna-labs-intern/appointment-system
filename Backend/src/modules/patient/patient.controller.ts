// src/modules/patient/patient.controller.ts
import { Request, Response } from "express";
import { PatientService } from "./patient.service";

export class PatientController {
  static async create(req: Request, res: Response) {
    try {
      const patient = await PatientService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Patient created successfully",
        data: patient,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create patient",
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
        gender: req.query.gender as string,
      };

      const result = await PatientService.getAll(options);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch patients",
      });
    }
  }

  // ✅ GET BY ID - FIXED
  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = await PatientService.getById(id as string);
      res.status(200).json({
        success: true,
        data: patient,
      });
    } catch (error: any) {
      res.status(error.message === 'Patient not found' ? 404 : 500).json({
        success: false,
        message: error.message || "Failed to fetch patient",
      });
    }
  }

  // ✅ UPDATE - FIXED
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = await PatientService.update(id as string, req.body);
      res.status(200).json({
        success: true,
        message: "Patient updated successfully",
        data: patient,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update patient",
      });
    }
  }

  // ✅ DELETE - FIXED
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await PatientService.delete(id as string);
      res.status(200).json({
        success: true,
        message: "Patient deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete patient",
      });
    }
  }
}