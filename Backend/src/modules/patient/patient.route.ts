import { Router } from "express";
import { PatientController } from "./patient.controller";
import validateRequest from "../../middleware/validateRequest";
import {
  createPatientSchema,
  updatePatientSchema,
  getPatientsSchema,
  patientIdSchema,
} from "./patient.validation";

const router = Router();

router.get("/", validateRequest(getPatientsSchema), PatientController.getAll);
router.get("/:id", validateRequest(patientIdSchema), PatientController.getOne);
router.post("/", validateRequest(createPatientSchema), PatientController.create);
router.put("/:id", validateRequest(updatePatientSchema), PatientController.update);
router.patch("/:id", validateRequest(updatePatientSchema), PatientController.update);
router.delete("/:id", validateRequest(patientIdSchema), PatientController.delete);

export default router;