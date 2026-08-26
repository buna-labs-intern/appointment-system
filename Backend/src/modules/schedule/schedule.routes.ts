import { Router } from "express";
import catchAsync from "../../utils/catchAsync";
import validateRequest from "../../middleware/validateRequest";
import { authorize } from "../../middleware/authMiddleware";
import { ScheduleController } from "./schedule.controller";
import {
  createShiftSchema,
  getShiftsSchema,
  shiftIdSchema,
  updateShiftSchema,
} from "./schedule.validation";

const scheduleRouter = Router();

scheduleRouter.get(
  "/",
  validateRequest(getShiftsSchema),
  catchAsync(ScheduleController.getAll),
);

scheduleRouter.get(
  "/:id",
  validateRequest(shiftIdSchema),
  catchAsync(ScheduleController.getById),
);

scheduleRouter.post(
  "/",
  authorize("ADMIN"),
  validateRequest(createShiftSchema),
  catchAsync(ScheduleController.create),
);

scheduleRouter.put(
  "/:id",
  authorize("ADMIN"),
  validateRequest(updateShiftSchema),
  catchAsync(ScheduleController.update),
);

scheduleRouter.patch(
  "/:id",
  authorize("ADMIN"),
  validateRequest(updateShiftSchema),
  catchAsync(ScheduleController.update),
);

scheduleRouter.delete(
  "/:id",
  authorize("ADMIN"),
  validateRequest(shiftIdSchema),
  catchAsync(ScheduleController.delete),
);

export default scheduleRouter;
