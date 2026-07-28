import { Router } from "express";
import dashboardController from "./dashboard.controller";
import catchAsync from "../../utils/catchAsync";

const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  catchAsync(dashboardController.getDashboard)
);

export default dashboardRouter;