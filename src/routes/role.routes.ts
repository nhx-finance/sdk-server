import { Router } from "express";
import {
  grantAdminRole,
  grantRole,
  checkRole,
} from "../controllers/role.controller";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post("/grant-admin-role", asyncHandler(grantAdminRole));
router.post("/grant-role", asyncHandler(grantRole));
router.get("/check-role/:accountId/:role", asyncHandler(checkRole));

export default router;
