import { Router } from "express";
import { TenantController } from "./tenant.controller";
import validateRequest from "../../middleware/validateRequest";
import { authorize } from "../../middleware/authMiddleware";
import {
  createTenantSchema,
  updateTenantSchema,
  blockTenantSchema,
  listTenantsQuerySchema,
} from "./tenant.validation";

const router = Router();

router.post(
  "/",
  authorize("SUPER_ADMIN"),
  validateRequest(createTenantSchema),
  TenantController.create
);

router.get(
  "/",
  authorize("SUPER_ADMIN"),
  validateRequest(listTenantsQuerySchema),
  TenantController.getAll
);

router.get("/:id", authorize("SUPER_ADMIN"), TenantController.getById);

router.get("/:id/branches", authorize("SUPER_ADMIN"), TenantController.listBranches);

router.put(
  "/:id",
  authorize("SUPER_ADMIN"),
  validateRequest(updateTenantSchema),
  TenantController.update
);

router.patch(
  "/:id/block",
  authorize("SUPER_ADMIN"),
  validateRequest(blockTenantSchema),
  TenantController.block
);

router.patch(
  "/:id/unblock",
  authorize("SUPER_ADMIN"),
  TenantController.unblock
);

router.delete("/:id", authorize("SUPER_ADMIN"), TenantController.delete);

export default router;
