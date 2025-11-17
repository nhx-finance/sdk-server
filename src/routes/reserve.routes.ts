import { Router } from "express";
import { updateReserve, getReserve } from "../controllers/reserve.controller";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post("/update", asyncHandler(updateReserve));
router.get("/", asyncHandler(getReserve));

export default router;
