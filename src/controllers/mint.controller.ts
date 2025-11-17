import { Request, Response } from "express";
import { StableCoin, CashInRequest } from "@hashgraph/stablecoin-npm-sdk";
import { initializeSDK } from "../services/sdk.service";
import { env } from "../config/env.config";

export const mint = async (req: Request, res: Response): Promise<void> => {
  await initializeSDK();

  if (!env.tokenId || !env.multisigAccountId) {
    res.status(400).json({
      error: "Token ID or target ID is not set in the environment variables",
    });
    return;
  }

  const { amount } = req.body;

  if (!amount) {
    res.status(400).json({
      error: "Missing required fields: amount",
    });
    return;
  }

  const result = await StableCoin.cashIn(
    new CashInRequest({
      tokenId: env.tokenId,
      targetId: env.multisigAccountId,
      amount,
    })
  );

  res.json({ success: result });
};
