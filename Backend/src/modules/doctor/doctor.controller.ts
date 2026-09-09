import { Request, Response } from "express";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../utils/sendResponse";
import { AuthRequest } from "../../middleware/authMiddleware";

export class DoctorController {
  static async create(req: AuthRequest, res: Response) {
    const ctx = (req as any).branchContext ?? (req.user ? { branchIds: req.user.branchIds, branchAll: req.user.branchAll, tenantId: req.user.tenantId } : null);
    const doctor = await DoctorService.create(req.body, ctx);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  }

  static async getAll(req: AuthRequest, res: Response) {
    const ctx = (req as any).branchContext ?? (req.user ? { branchIds: req.user.branchIds, branchAll: req.user.branchAll, tenantId: req.user.tenantId } : null);
    const result: any = await DoctorService.getAll(req.query, ctx);
    if (result && result.meta) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctors fetched successfully",
        meta: result.meta,
        data: result.data,
      });
    } else {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctors fetched successfully",
        data: result,
      });
    }
  }

  static async getOne(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const ctx = (req as any).branchContext ?? (req.user ? { branchIds: req.user.branchIds, branchAll: req.user.branchAll, tenantId: req.user.tenantId } : null);
    const doctor = await DoctorService.getById(id as string, ctx);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor fetched successfully",
      data: doctor,
    });
  }

  static async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const ctx = (req as any).branchContext ?? (req.user ? { branchIds: req.user.branchIds, branchAll: req.user.branchAll, tenantId: req.user.tenantId } : null);
    const doctor = await DoctorService.update(id as string, req.body, ctx);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
    });
  }

  static async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const ctx = (req as any).branchContext ?? (req.user ? { branchIds: req.user.branchIds, branchAll: req.user.branchAll, tenantId: req.user.tenantId } : null);
    await DoctorService.delete(id as string, ctx);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor deleted successfully",
    });
  }

  static async activate(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const ctx = (req as any).branchContext ?? (req.user ? { branchIds: req.user.branchIds, branchAll: req.user.branchAll, tenantId: req.user.tenantId } : null);
    const doctor = await DoctorService.activate(id as string, ctx);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor activated successfully",
      data: doctor,
    });
  }

  static async deactivate(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const ctx = (req as any).branchContext ?? (req.user ? { branchIds: req.user.branchIds, branchAll: req.user.branchAll, tenantId: req.user.tenantId } : null);
    const doctor = await DoctorService.deactivate(id as string, ctx);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor deactivated successfully",
      data: doctor,
    });
  }

  static async toggleActive(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const ctx = (req as any).branchContext ?? (req.user ? { branchIds: req.user.branchIds, branchAll: req.user.branchAll, tenantId: req.user.tenantId } : null);
    const doctor = await DoctorService.getById(id as string, ctx);
    const updated = doctor.isActive
      ? await DoctorService.deactivate(id as string)
      : await DoctorService.activate(id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Doctor ${updated.isActive ? "activated" : "deactivated"} successfully`,
      data: updated,
    });
  }
}