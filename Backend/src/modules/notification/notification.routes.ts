import { Router } from "express";
import notificationController from "./notification.controller";
import catchAsync from "../../utils/catchAsync";
import validateRequest from "../../middleware/validateRequest";
import { createNotificationSchema } from "./notification.validation";

const notificationRouter = Router();

notificationRouter.get(
  "/unread-count",
  catchAsync(notificationController.getUnreadCount)
);

notificationRouter.patch(
  "/read-all",
  catchAsync(notificationController.markAllAsRead)
);

notificationRouter.delete(
  "/clear-all",
  catchAsync(notificationController.clearAll)
);

notificationRouter.get(
  "/",
  catchAsync(notificationController.getAll)
);

notificationRouter.post(
  "/",
  validateRequest(createNotificationSchema),
  catchAsync(notificationController.create)
);

notificationRouter.patch(
  "/:id/read",
  catchAsync(notificationController.markAsRead)
);

notificationRouter.delete(
  "/:id",
  catchAsync(notificationController.delete)
);

export default notificationRouter;
