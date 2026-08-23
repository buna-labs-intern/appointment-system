import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { DashboardService } from "./dashboard.service";

const dashboardService = new DashboardService();

class DashboardController {
  getDashboard = async (req: Request, res: Response) => {
    const result = await dashboardService.getDashboardData();

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