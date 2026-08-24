import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import catchAsync from "../../utils/catchAsync";

const doctorRouter = Router();

doctorRouter.get("/", catchAsync(DoctorController.getAll));
doctorRouter.get("/:id", catchAsync(DoctorController.getOne));
doctorRouter.post("/", catchAsync(DoctorController.create));
doctorRouter.put("/:id", catchAsync(DoctorController.update));
doctorRouter.patch("/:id", catchAsync(DoctorController.update));
doctorRouter.patch("/:id/activate", catchAsync(DoctorController.activate));
doctorRouter.patch("/:id/deactivate", catchAsync(DoctorController.deactivate));
doctorRouter.patch("/:id/status", catchAsync(DoctorController.toggleActive));
doctorRouter.delete("/:id", catchAsync(DoctorController.delete));

export default doctorRouter;