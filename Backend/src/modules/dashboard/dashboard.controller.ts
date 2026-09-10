import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { DashboardService } from "./dashboard.service";

const dashboardService = new DashboardService();

class DashboardController {
  getDashboard = async (req: Request, res: Response) => {
    const ctx = (req as any).branchContext ?? ((req as any).user ? { branchIds: (req as any).user.branchIds, branchAll: (req as any).user.branchAll, tenantId: (req as any).user.tenantId } : null);
    const branchId = (req.query.branchId as string) || (ctx && !ctx.branchAll && ctx.branchIds.length === 1 ? ctx.branchIds[0] : undefined);
    const result = await dashboardService.getDashboardData(branchId, ctx);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Dashboard data retrieved successfully",
      data: result,
    });
  };
}

const dashboardController = new DashboardController();

export default dashboardController;