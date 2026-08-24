import AppError from "../../utils/AppError";
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

  static async getAll(query: any) {
    const options: INotificationQueryOptions = {
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      type: query.type as string | undefined,
      search: query.search as string | undefined,
    };

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

  static async markAsRead(id: string) {
    const existing = await NotificationRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Notification not found");
    }
    return NotificationRepository.markAsRead(id);
  }

  static async markAllAsRead() {
    await NotificationRepository.markAllAsRead();
    return { message: "All notifications marked as read" };
  }

  static async delete(id: string) {
    const existing = await NotificationRepository.findById(id);
    if (!existing) {
      throw new AppError(404, "Notification not found");
    }
    await NotificationRepository.delete(id);
    return { message: "Notification deleted successfully" };
  }

  static async clearAll() {
    await NotificationRepository.clearAll();
    return { message: "All notifications cleared" };
  }
}

export default NotificationService;
