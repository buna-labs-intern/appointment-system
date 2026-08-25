import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { ScheduleService } from "./schedule.service";

export class ScheduleController {
  static async getAll(req: Request, res: Response) {
    const shifts = await ScheduleService.getAll({
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      receptionistId: req.query.receptionistId as string | undefined,
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Shifts fetched successfully",
      data: shifts,
    });
  }

  static async getById(req: Request, res: Response) {
    const shift = await ScheduleService.getById(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Shift fetched successfully",
      data: shift,
    });
  }

  static async create(req: Request, res: Response) {
    const shift = await ScheduleService.create(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Shift created successfully",
      data: shift,
    });
  }

  static async update(req: Request, res: Response) {
    const shift = await ScheduleService.update(req.params.id as string, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Shift updated successfully",
      data: shift,
    });
  }

  static async delete(req: Request, res: Response) {
    const result = await ScheduleService.delete(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: result.message,
      data: result,
    });
  }
}
