import { Router } from "express";
import { mint } from "../controllers/mint.controller";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post("/", asyncHandler(mint));

export default router;
