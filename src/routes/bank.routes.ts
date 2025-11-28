import { Router } from "express";
import { getBankDetails } from "../controllers/bank.controller";

const router = Router();

router.get("/", getBankDetails);

export default router;
