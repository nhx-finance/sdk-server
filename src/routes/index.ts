import { Router } from "express";
import tokenRoutes from "./token.routes";
import balanceRoutes from "./balance.routes";
import mintRoutes from "./mint.routes";
import reserveRoutes from "./reserve.routes";
import roleRoutes from "./role.routes";
import healthRoutes from "./health.routes";

const router = Router();

router.use("/api/token", tokenRoutes);
router.use("/api/balance", balanceRoutes);
router.use("/api/mint", mintRoutes);
router.use("/api/reserve", reserveRoutes);
router.use("/api", roleRoutes);
router.use("/health", healthRoutes);

export default router;
