import { Router } from "express";
import { getTokenInfo, transferToken } from "../controllers/token.controller";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/", asyncHandler(getTokenInfo));
router.post("/transfer", asyncHandler(transferToken));

export default router;
