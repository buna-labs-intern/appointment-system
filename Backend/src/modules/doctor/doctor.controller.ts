// src/modules/doctor/doctor.controller.ts
import { Request, Response } from "express";
import { DoctorService } from "./doctor.service";

export class DoctorController {
  static async create(req: Request, res: Response) {
    try {
      const doctor = await DoctorService.create(req.body);
      res.status(201).json({
        success: true,
        message: "Doctor created successfully",
        data: doctor,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create doctor",
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const doctors = await DoctorService.getAll();
      res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch doctors",
      });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctor = await DoctorService.getById(id as string);
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
      
      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch doctor",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctor = await DoctorService.update(id as string, req.body);
      res.status(200).json({
        success: true,
        message: "Doctor updated successfully",
        data: doctor,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update doctor",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DoctorService.delete(id as string);
      res.status(200).json({
        success: true,
        message: "Doctor deleted successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete doctor",
      });
    }
  }

  // ✅ Toggle Active - Fixed with proper null check
  static async toggleActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Get the doctor first
      const doctor = await DoctorService.getById(id as string);
      
      // Check if doctor exists
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
      
      // Toggle the active status
      const updated = await DoctorService.update(id as string, {
        isActive: !doctor.isActive
      });
      
      res.status(200).json({
        success: true,
        message: `Doctor ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to toggle doctor status",
      });
    }
  }
}