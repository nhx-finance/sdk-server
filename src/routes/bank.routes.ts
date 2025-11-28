import { Router } from "express";
import { getBankDetails } from "../controllers/bank.controller";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get("/", asyncHandler(getBankDetails));

export default router;
