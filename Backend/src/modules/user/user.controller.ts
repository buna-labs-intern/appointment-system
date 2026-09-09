import { Request, Response } from "express";
import { UserService } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import { AuthRequest } from "../../middleware/authMiddleware";

export class UserController {
  static async create(req: AuthRequest, res: Response) {
    const user = await UserService.create(req.body, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Receptionist account created successfully",
      data: user,
    });
  }

  static async getAll(req: AuthRequest, res: Response) {
    const result = await UserService.getAll(req.query, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  }

  static async getById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const user = await UserService.getById(id as string, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  }

  static async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const user = await UserService.update(id as string, req.body, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User updated successfully",
      data: user,
    });
  }

  static async activate(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const user = await UserService.activate(id as string, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User activated successfully",
      data: user,
    });
  }

  static async deactivate(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const user = await UserService.deactivate(id as string, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User deactivated successfully",
      data: user,
    });
  }

  static async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const user = await UserService.delete(id as string, req.user?.id, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User deleted successfully",
      data: user,
    });
  }
}
