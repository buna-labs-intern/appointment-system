import { Request, Response } from "express";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../utils/sendResponse";

export class DoctorController {
  static async create(req: Request, res: Response) {
    const doctor = await DoctorService.create(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Doctor created successfully",
      data: doctor,
    });
  }

  static async getAll(req: Request, res: Response) {
    const result: any = await DoctorService.getAll(req.query);
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

  static async getOne(req: Request, res: Response) {
    const { id } = req.params;
    const doctor = await DoctorService.getById(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor fetched successfully",
      data: doctor,
    });
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const doctor = await DoctorService.update(id as string, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
    });
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    await DoctorService.delete(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor deleted successfully",
    });
  }

  static async activate(req: Request, res: Response) {
    const { id } = req.params;
    const doctor = await DoctorService.activate(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor activated successfully",
      data: doctor,
    });
  }

  static async deactivate(req: Request, res: Response) {
    const { id } = req.params;
    const doctor = await DoctorService.deactivate(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Doctor deactivated successfully",
      data: doctor,
    });
  }

  static async toggleActive(req: Request, res: Response) {
    const { id } = req.params;
    const doctor = await DoctorService.getById(id as string);
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