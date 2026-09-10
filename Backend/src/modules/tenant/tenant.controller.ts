import { Request, Response } from "express";
import { TenantService } from "./tenant.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

export class TenantController {
  static create = catchAsync(async (req: Request, res: Response) => {
    const result = await TenantService.create(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Clinic created with main branch and owner",
      data: result,
    });
  });

  static getAll = catchAsync(async (req: Request, res: Response) => {
    const result = await TenantService.getAll(req.query as Record<string, any>);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Clinics fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  });

  static getById = catchAsync(async (req: Request, res: Response) => {
    const tenant = await TenantService.getById(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Clinic fetched successfully",
      data: tenant,
    });
  });

  static listBranches = catchAsync(async (req: Request, res: Response) => {
    const branches = await TenantService.listBranches(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Clinic branches fetched successfully",
      data: branches,
    });
  });

  static update = catchAsync(async (req: Request, res: Response) => {
    const tenant = await TenantService.update(req.params.id as string, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Clinic updated successfully",
      data: tenant,
    });
  });

  static block = catchAsync(async (req: Request, res: Response) => {
    const tenant = await TenantService.block(req.params.id as string, req.body?.reason);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Clinic banned successfully",
      data: tenant,
    });
  });

  static unblock = catchAsync(async (req: Request, res: Response) => {
    const tenant = await TenantService.unblock(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Clinic unbanned successfully",
      data: tenant,
    });
  });

  static delete = catchAsync(async (req: Request, res: Response) => {
    await TenantService.delete(req.params.id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Clinic deleted successfully",
      data: null,
    });
  });
}

export default TenantController;
