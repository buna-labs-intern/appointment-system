import AppError from "../../utils/AppError";
import prisma from "../../shared/prisma";
import NotificationRepository from "./notification.repository";
import { ICreateNotificationPayload, INotificationQueryOptions } from "../../interfaces/notification.interface";

export class NotificationService {
  /**
   * Helper to create a notification from anywhere in the codebase.
   * Logs error without throwing so main business transactions don't fail.
   */
  static async createNotification(payload: ICreateNotificationPayload) {
    try {
      return await NotificationRepository.create(payload);
    } catch (err) {
      console.error("Failed to create notification:", err);
      return null;
    }
  }

  static async getAll(query: any, ctx?: any) {
    const options: any = {
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      type: query.type as string | undefined,
      search: query.search as string | undefined,
    };
    const branchId = query.branchId;
    if (ctx && !ctx.branchAll && ctx.branchIds.length === 1) options.branchId = ctx.branchIds[0];
    else if (branchId) {
      if (ctx && !ctx.branchAll && !ctx.branchIds.includes(branchId)) throw new AppError(403, "Not assigned to that branch");
      options.branchId = branchId;
    } else if (ctx && !ctx.branchAll && ctx.branchIds.length > 1) {
      options.branchIds = ctx.branchIds;
    } else if (ctx?.tenantId) {
      options.tenantId = ctx.tenantId;
    }

    if (query.filter === "unread" || query.isRead === "false" || query.isRead === false) {
      options.isRead = false;
    } else if (query.filter === "read" || query.isRead === "true" || query.isRead === true) {
      options.isRead = true;
    }

    return NotificationRepository.findAll(options);
  }

  static async getUnreadCount() {
    const unreadCount = await NotificationRepository.countUnread();
    return { unreadCount };
  }

  static async markAsRead(id: string, ctx?: { tenantId?: string | null; branchIds?: string[]; branchAll?: boolean } | null) {
    const existing = await NotificationRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Notification not found");
    }
    await this.assertNotificationAccess(existing, ctx);
    return NotificationRepository.markAsRead(id);
  }

  static async markAllAsRead() {
    await NotificationRepository.markAllAsRead();
    return { message: "All notifications marked as read" };
  }

  static async delete(id: string, ctx?: { tenantId?: string | null; branchIds?: string[]; branchAll?: boolean } | null) {
    const existing = await NotificationRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Notification not found");
    }
    await this.assertNotificationAccess(existing, ctx);
    await NotificationRepository.delete(id);
    return { message: "Notification deleted successfully" };
  }

  private static async assertNotificationAccess(
    notification: { branchId: string | null },
    ctx?: { tenantId?: string | null; branchIds?: string[]; branchAll?: boolean } | null
  ) {
    if (!ctx?.tenantId) return;
    const branch = notification.branchId
      ? await prisma.branch.findUnique({ where: { id: notification.branchId }, select: { tenantId: true } })
      : null;
    if (branch?.tenantId && branch.tenantId !== ctx.tenantId) {
      throw new AppError(404, "Notification not found");
    }
  }

  static async clearAll() {
    await NotificationRepository.clearAll();
    return { message: "All notifications cleared" };
  }
}

export default NotificationService;
