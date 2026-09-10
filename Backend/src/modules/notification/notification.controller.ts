import { Request, Response } from "express";
import NotificationService from "./notification.service";
import sendResponse from "../../utils/sendResponse";

export class NotificationController {
  create = async (req: Request, res: Response) => {
    const result = await NotificationService.createNotification(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Notification created successfully",
      data: result,
    });
  };

  getAll = async (req: Request, res: Response) => {
    const ctx = (req as any).branchContext ?? ((req as any).user ? { branchIds: (req as any).user.branchIds, branchAll: (req as any).user.branchAll, tenantId: (req as any).user.tenantId } : null);
    const result = await NotificationService.getAll(req.query, ctx);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notifications retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  };

  getUnreadCount = async (req: Request, res: Response) => {
    const result = await NotificationService.getUnreadCount();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Unread count retrieved successfully",
      data: result,
    });
  };

  markAsRead = async (req: Request, res: Response) => {
    const ctx = (req as any).branchContext ?? ((req as any).user ? { branchIds: (req as any).user.branchIds, branchAll: (req as any).user.branchAll, tenantId: (req as any).user.tenantId } : null);
    const result = await NotificationService.markAsRead(req.params.id as string, ctx);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notification marked as read",
      data: result,
    });
  };

  markAllAsRead = async (req: Request, res: Response) => {
    const result = await NotificationService.markAllAsRead();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  };

  delete = async (req: Request, res: Response) => {
    const ctx = (req as any).branchContext ?? ((req as any).user ? { branchIds: (req as any).user.branchIds, branchAll: (req as any).user.branchAll, tenantId: (req as any).user.tenantId } : null);
    const result = await NotificationService.delete(req.params.id as string, ctx);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Notification deleted successfully",
      data: result,
    });
  };

  clearAll = async (req: Request, res: Response) => {
    const result = await NotificationService.clearAll();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "All notifications cleared",
      data: result,
    });
  };
}

const notificationController = new NotificationController();
export default notificationController;
