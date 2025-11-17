import { Router } from "express";
import { grantAdminRole, checkRole } from "../controllers/role.controller";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post("/grant-admin-role", asyncHandler(grantAdminRole));
router.get("/check-role/:accountId/:role", asyncHandler(checkRole));

export default router;
