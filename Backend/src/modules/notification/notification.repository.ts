import prisma from "../../shared/prisma";
import { ICreateNotificationPayload, INotificationQueryOptions } from "../../interfaces/notification.interface";

export class NotificationRepository {
  static async create(payload: ICreateNotificationPayload) {
    return prisma.notification.create({
      data: {
        title: payload.title,
        message: payload.message,
        type: payload.type || "system",
        isRead: false,
        branchId: (payload as any).branchId || null,
      } as any,
    });
  }

  static async findAll(options: INotificationQueryOptions & { branchId?: string; branchIds?: string[]; branchAll?: boolean; tenantId?: string | null } = {}) {
    const { page, limit, isRead, type, search, branchId, branchIds, branchAll, tenantId } = options as any;
    const where: any = {};
    if (branchId) where.branchId = branchId;
    else if (!branchAll && branchIds?.length) where.branchId = { in: branchIds };
    else if (tenantId) where.branch = { tenantId };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const take = limit ? Number(limit) : undefined;
    const skip = page && limit ? (Number(page) - 1) * Number(limit) : undefined;

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : total,
        totalPages: limit ? Math.ceil(total / Number(limit)) : 1,
      },
    };
  }

  static async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  static async countUnread() {
    return prisma.notification.count({
      where: { isRead: false },
    });
  }

  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  static async markAllAsRead() {
    return prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  }

  static async delete(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  }

  static async clearAll() {
    return prisma.notification.deleteMany({});
  }
}

export default NotificationRepository;
