import { Router } from "express";
import { getTokenInfo } from "../controllers/token.controller";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/", asyncHandler(getTokenInfo));

export default router;
