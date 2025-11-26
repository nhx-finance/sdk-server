import { Router } from "express";
import { getTokenInfo, transferToken } from "../controllers/token.controller";
import { asyncHandler } from "../middleware/errorHandler";
import { apiKeyAuth } from "../middleware/apiKeyAuth";

const router = Router();

router.get("/", asyncHandler(getTokenInfo));

router.post("/transfer", apiKeyAuth, asyncHandler(transferToken));

export default router;
