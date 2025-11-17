import { Request, Response } from "express";
import { getSDKInitializedStatus } from "../services/sdk.service";

export const getHealth = (req: Request, res: Response): void => {
  res.json({ status: "ok", sdkInitialized: getSDKInitializedStatus() });
};
