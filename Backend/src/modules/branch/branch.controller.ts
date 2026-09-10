import { Request, Response } from "express";
import { BranchService } from "./branch.service";
import sendResponse from "../../utils/sendResponse";
import { AuthRequest } from "../../middleware/authMiddleware";

export class BranchController {
  static async create(req: AuthRequest, res: Response) {
    const branch = await BranchService.create(req.body, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, { statusCode: 201, success: true, message: "Branch created", data: branch });
  }

  static async getAll(req: Request, res: Response) {
    const result = await BranchService.getAll(req.query);
    // support both paginated and plain array shape
    if (Array.isArray(result)) {
      sendResponse(res, { statusCode: 200, success: true, message: "Branches fetched", data: result });
    } else {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Branches fetched",
        data: (result as any).data,
        meta: (result as any).meta,
      });
    }
  }

  static async getSelect(req: AuthRequest, res: Response) {
    const branches = await BranchService.getSelect({ tenantId: req.user?.tenantId ?? null });
    sendResponse(res, { statusCode: 200, success: true, message: "Branches fetched", data: branches });
  }

  static async getById(req: AuthRequest, res: Response) {
    const branch = await BranchService.getById(req.params.id as string, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, { statusCode: 200, success: true, message: "Branch fetched", data: branch });
  }

  static async update(req: AuthRequest, res: Response) {
    const branch = await BranchService.update(req.params.id as string, req.body, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, { statusCode: 200, success: true, message: "Branch updated", data: branch });
  }

  static async block(req: AuthRequest, res: Response) {
    const branch = await BranchService.block(req.params.id as string, req.body?.reason, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, { statusCode: 200, success: true, message: "Branch archived", data: branch });
  }

  static async unblock(req: AuthRequest, res: Response) {
    const branch = await BranchService.unblock(req.params.id as string, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, { statusCode: 200, success: true, message: "Branch restored", data: branch });
  }

  static async delete(req: AuthRequest, res: Response) {
    await BranchService.delete(req.params.id as string, { tenantId: req.user?.tenantId ?? null });
    sendResponse(res, { statusCode: 200, success: true, message: "Branch deleted", data: null });
  }
}
