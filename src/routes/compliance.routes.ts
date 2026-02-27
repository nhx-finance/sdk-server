import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import {
  freezeAccount,
  getFrozenAccounts,
  unfreezeAccount,
  wipeAccount,
  getRecentlyFrozenOrWipedAccounts,
} from "../controllers/compliance.controller";

const router = Router();

router.post("/freeze", asyncHandler(freezeAccount));
router.post("/unfreeze", asyncHandler(unfreezeAccount));
router.post("/wipe", asyncHandler(wipeAccount));
router.get("/frozen", asyncHandler(getFrozenAccounts));
router.get("/recent", asyncHandler(getRecentlyFrozenOrWipedAccounts));

export default router;
