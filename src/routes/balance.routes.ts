import { Router } from "express";
import { getBalance } from "../controllers/balance.controller";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/", asyncHandler(getBalance));

export default router;
