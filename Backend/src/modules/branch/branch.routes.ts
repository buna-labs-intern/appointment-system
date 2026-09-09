import { Router } from "express";
import { BranchController } from "./branch.controller";
import catchAsync from "../../utils/catchAsync";
import validateRequest from "../../middleware/validateRequest";
import { authorize } from "../../middleware/authMiddleware";
import { blockBranchSchema, createBranchSchema, updateBranchSchema } from "./branch.validation";

const branchRouter = Router();

// Select endpoint — allowed for any authenticated user (used for appointment branch picker)
branchRouter.get("/select", catchAsync(BranchController.getSelect));

branchRouter.post("/", authorize("ADMIN"), validateRequest(createBranchSchema), catchAsync(BranchController.create));
branchRouter.get("/", catchAsync(BranchController.getAll));
branchRouter.get("/:id", catchAsync(BranchController.getById));
branchRouter.put("/:id", authorize("ADMIN"), validateRequest(updateBranchSchema), catchAsync(BranchController.update));
branchRouter.patch("/:id/block", authorize("ADMIN"), validateRequest(blockBranchSchema), catchAsync(BranchController.block));
branchRouter.patch("/:id/unblock", authorize("ADMIN"), catchAsync(BranchController.unblock));
branchRouter.delete("/:id", authorize("ADMIN"), catchAsync(BranchController.delete));

export default branchRouter;
