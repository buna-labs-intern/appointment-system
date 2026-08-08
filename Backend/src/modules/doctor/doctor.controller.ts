// src/modules/doctor/doctor.controller.ts
import { Request, Response } from "express";
import { DoctorService } from "./doctor.service";

export class DoctorController {
  static async create(req: Request, res: Response) {
    try {
      console.log("📥 Creating doctor:", req.body);
      
      const doctor = await DoctorService.create(req.body);
      
      res.status(201).json({
        success: true,
        message: "Doctor created successfully",
        data: doctor,
      });
    } catch (error: any) {
      console.error("❌ Error:", error);
      
      // Handle duplicate phone
      if (error.code === "P2002") {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }
      
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
      const doctor = await DoctorService.getById(id);
      
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
      const doctor = await DoctorService.update(id, req.body);
      
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
      await DoctorService.delete(id);
      
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
}