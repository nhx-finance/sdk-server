import { Request, Response } from "express";
import {
  StableCoin,
  GetAccountBalanceRequest,
} from "@hashgraph/stablecoin-npm-sdk";
import { initializeSDK } from "../services/sdk.service";
import { env } from "../config/env.config";

export const getBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  await initializeSDK();

  if (!env.tokenId || !env.multisigAccountId) {
    res.status(400).json({
      error: "Token ID or account ID is not set in the environment variables",
    });
    return;
  }

  const balance = await StableCoin.getBalanceOf(
    new GetAccountBalanceRequest({
      tokenId: env.tokenId,
      targetId: env.multisigAccountId,
    })
  );

  res.json({ balance: balance.value.toString() });
};
