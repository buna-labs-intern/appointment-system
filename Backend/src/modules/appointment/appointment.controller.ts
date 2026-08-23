import { Request, Response } from "express";
import { AppointmentService } from "./appointment.service";
import sendResponse from "../../utils/sendResponse";

export class AppointmentController {
  create = async (req: Request, res: Response) => {
    const result = await AppointmentService.create(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Appointment created successfully",
      data: result,
    });
  };

  getAll = async (req: Request, res: Response) => {
    const result = await AppointmentService.getAll(req.query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointments retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  };

  getById = async (req: Request, res: Response) => {
    const result = await AppointmentService.getById(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment retrieved successfully",
      data: result,
    });
  };

  update = async (req: Request, res: Response) => {
    const result = await AppointmentService.update(
      req.params.id as string,
      req.body
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment updated successfully",
      data: result,
    });
  };

  cancel = async (req: Request, res: Response) => {
    const result = await AppointmentService.cancel(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment cancelled successfully",
      data: result,
    });
  };

  checkIn = async (req: Request, res: Response) => {
    const result = await AppointmentService.checkIn(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Patient checked in successfully",
      data: result,
    });
  };

  complete = async (req: Request, res: Response) => {
    const result = await AppointmentService.complete(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment completed successfully",
      data: result,
    });
  };

  noShow = async (req: Request, res: Response) => {
    const result = await AppointmentService.noShow(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment marked as no-show",
      data: result,
    });
  };

  delete = async (req: Request, res: Response) => {
    await AppointmentService.delete(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment deleted successfully",
      data: null,
    });
  };
}

const appointmentController = new AppointmentController();
export default appointmentController;