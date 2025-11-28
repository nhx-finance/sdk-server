import { Router } from "express";
import tokenRoutes from "./token.routes";
import balanceRoutes from "./balance.routes";
import mintRoutes from "./mint.routes";
import reserveRoutes from "./reserve.routes";
import roleRoutes from "./role.routes";
import healthRoutes from "./health.routes";
import bankRoutes from "./balance.routes";
import { apiKeyAuth } from "../middleware/apiKeyAuth";

const router = Router();

router.use("/health", healthRoutes);
router.use("/api/bank", bankRoutes);

router.use("/api/token", tokenRoutes);

router.use("/api", apiKeyAuth);
router.use("/api/balance", balanceRoutes);
router.use("/api/mint", mintRoutes);
router.use("/api/reserve", reserveRoutes);
router.use("/api", roleRoutes);

export default router;
