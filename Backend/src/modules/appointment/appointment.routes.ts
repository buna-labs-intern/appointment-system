import { Router } from "express";
import appointmentController from "./appointment.controller";
import catchAsync from "../../utils/catchAsync";
import validateRequest from "../../middleware/validateRequest";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "./appointment.validation";

const appointmentRouter = Router();

appointmentRouter.post(
  "/",
  validateRequest(createAppointmentSchema),
  catchAsync(appointmentController.create)
);

appointmentRouter.get(
  "/",
  catchAsync(appointmentController.getAll)
);

appointmentRouter.get(
  "/:id",
  catchAsync(appointmentController.getById)
);

appointmentRouter.put(
  "/:id",
  validateRequest(updateAppointmentSchema),
  catchAsync(appointmentController.update)
);

appointmentRouter.patch(
  "/:id",
  validateRequest(updateAppointmentSchema),
  catchAsync(appointmentController.update)
);

appointmentRouter.patch(
  "/:id/cancel",
  catchAsync(appointmentController.cancel)
);

appointmentRouter.patch(
  "/:id/check-in",
  catchAsync(appointmentController.checkIn)
);

appointmentRouter.patch(
  "/:id/complete",
  catchAsync(appointmentController.complete)
);

appointmentRouter.patch(
  "/:id/no-show",
  catchAsync(appointmentController.noShow)
);

appointmentRouter.delete(
  "/:id",
  catchAsync(appointmentController.delete)
);

export default appointmentRouter;