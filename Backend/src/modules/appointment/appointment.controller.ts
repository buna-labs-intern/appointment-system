import { Request, Response } from "express";
import { AppointmentService } from "./appointment.service";
import sendResponse from "../../utils/sendResponse";

const appointmentService = new AppointmentService();

export class AppointmentController {
  create = async (req: Request, res: Response) => {
    const result = await appointmentService.create(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Appointment created successfully",
      data: result,
    });
  };

  getAll = async (req: Request, res: Response) => {
    const result = await appointmentService.getAll(req.query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointments retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  };

  getById = async (req: Request, res: Response) => {
    const result = await appointmentService.getById(req.params.id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment retrieved successfully",
      data: result,
    });
  };

  update = async (req: Request, res: Response) => {
    const result = await appointmentService.update(
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
    const result = await appointmentService.cancel(req.params.id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment cancelled successfully",
      data: result,
    });
  };

  checkIn = async (req: Request, res: Response) => {
    const result = await appointmentService.checkIn(req.params.id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Patient checked in successfully",
      data: result,
    });
  };

  complete = async (req: Request, res: Response) => {
    const result = await appointmentService.complete(req.params.id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment completed successfully",
      data: result,
    });
  };

  noShow = async (req: Request, res: Response) => {
    const result = await appointmentService.noShow(req.params.id as string);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Appointment marked as no-show",
      data: result,
    });
  };

  delete = async (req: Request, res: Response) => {
    await appointmentService.delete(req.params.id as string);

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