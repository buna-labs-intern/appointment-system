// src/modules/doctor/doctor.routes.ts
import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();

router.get("/", DoctorController.getAll);
router.get("/:id", DoctorController.getOne);
router.post("/", DoctorController.create);
router.put("/:id", DoctorController.update);
router.delete("/:id", DoctorController.delete);

export default router;