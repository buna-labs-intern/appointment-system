import { Router } from "express";
import { ServiceController } from "./service.controller";
import validateRequest from "../../middleware/validateRequest";
import {
  createServiceSchema,
  updateServiceSchema,
  getServicesSchema,
  serviceIdSchema,
} from "./service.validation";

const router = Router();

router.get("/", validateRequest(getServicesSchema), ServiceController.getAll);
router.get("/:id", validateRequest(serviceIdSchema), ServiceController.getOne);
router.post("/", validateRequest(createServiceSchema), ServiceController.create);
router.put("/:id", validateRequest(updateServiceSchema), ServiceController.update);
router.patch("/:id", validateRequest(updateServiceSchema), ServiceController.update);
router.patch("/:id/activate", validateRequest(serviceIdSchema), ServiceController.activate);
router.patch("/:id/deactivate", validateRequest(serviceIdSchema), ServiceController.deactivate);
router.delete("/:id", validateRequest(serviceIdSchema), ServiceController.delete);

export default router;