import { Router } from "express";
import { UserController } from "./user.controller";
import catchAsync from "../../utils/catchAsync";
import validateRequest from "../../middleware/validateRequest";
import { createUserSchema, updateUserSchema } from "./user.validation";
import { authorize } from "../../middleware/authMiddleware";

const userRouter = Router();

userRouter.post(
  "/",
  authorize("ADMIN"),
  validateRequest(createUserSchema),
  catchAsync(UserController.create)
);

userRouter.get(
  "/",
  authorize("ADMIN", "RECEPTIONIST"),
  catchAsync(UserController.getAll)
);

userRouter.get(
  "/:id",
  authorize("ADMIN", "RECEPTIONIST"),
  catchAsync(UserController.getById)
);

userRouter.put(
  "/:id",
  authorize("ADMIN"),
  validateRequest(updateUserSchema),
  catchAsync(UserController.update)
);

userRouter.patch(
  "/:id",
  authorize("ADMIN"),
  validateRequest(updateUserSchema),
  catchAsync(UserController.update)
);

userRouter.patch(
  "/:id/activate",
  authorize("ADMIN"),
  catchAsync(UserController.activate)
);

userRouter.patch(
  "/:id/deactivate",
  authorize("ADMIN"),
  catchAsync(UserController.deactivate)
);

userRouter.delete(
  "/:id",
  authorize("ADMIN"),
  catchAsync(UserController.delete)
);

export default userRouter;
