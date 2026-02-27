import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import {
  freezeAccount,
  getFrozenAccounts,
  unfreezeAccount,
  wipeAccount,
} from "../controllers/compliance.controller";

const router = Router();

router.post("/freeze", asyncHandler(freezeAccount));
router.post("/unfreeze", asyncHandler(unfreezeAccount));
router.post("/wipe", asyncHandler(wipeAccount));
router.get("/frozen", asyncHandler(getFrozenAccounts));

export default router;
