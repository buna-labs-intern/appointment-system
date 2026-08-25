import { Router } from "express";
import { AuthController } from "./auth.controller";
import catchAsync from "../../utils/catchAsync";
import validateRequest from "../../middleware/validateRequest";
import { changePasswordSchema, loginSchema } from "./auth.validation";
import { authenticate } from "../../middleware/authMiddleware";

const authRouter = Router();

authRouter.post(
  "/login",
  validateRequest(loginSchema),
  catchAsync(AuthController.login)
);

authRouter.get(
  "/me",
  authenticate,
  catchAsync(AuthController.getMe)
);

authRouter.post(
  "/change-password",
  authenticate,
  validateRequest(changePasswordSchema),
  catchAsync(AuthController.changePassword)
);

export default authRouter;
