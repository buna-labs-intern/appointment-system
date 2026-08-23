import { Router } from "express";
import { UserController } from "./user.controller";
import catchAsync from "../../utils/catchAsync";
import validateRequest from "../../middleware/validateRequest";
import { createUserSchema, updateUserSchema } from "./user.validation";

const userRouter = Router();

userRouter.post(
  "/",
  validateRequest(createUserSchema),
  catchAsync(UserController.create)
);

userRouter.get(
  "/",
  catchAsync(UserController.getAll)
);

userRouter.get(
  "/:id",
  catchAsync(UserController.getById)
);

userRouter.put(
  "/:id",
  validateRequest(updateUserSchema),
  catchAsync(UserController.update)
);

userRouter.patch(
  "/:id",
  validateRequest(updateUserSchema),
  catchAsync(UserController.update)
);

userRouter.patch(
  "/:id/activate",
  catchAsync(UserController.activate)
);

userRouter.patch(
  "/:id/deactivate",
  catchAsync(UserController.deactivate)
);

userRouter.delete(
  "/:id",
  catchAsync(UserController.delete)
);

export default userRouter;
