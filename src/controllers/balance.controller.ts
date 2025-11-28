import { Request, Response } from "express";
import {
  StableCoin,
  GetAccountBalanceRequest,
} from "@hashgraph/stablecoin-npm-sdk";
import { initializeSDK, retrySDKOperation } from "../services/sdk.service";
import { env } from "../config/env.config";

export const getBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!env.tokenId || !env.multisigAccountId) {
    res.status(400).json({
      error: "Token ID or account ID is not set in the environment variables",
    });
    return;
  }

  try {
    const balance = await retrySDKOperation(
      () =>
        StableCoin.getBalanceOf(
          new GetAccountBalanceRequest({
            tokenId: env.tokenId,
            targetId: env.multisigAccountId,
          })
        ),
      3,
      "Get balance"
    );

    res.json({ balance: balance.value.toString() });
  } catch (error) {
    console.error("Error getting balance:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: "Failed to retrieve balance",
      message:
        errorMessage.includes("502") || errorMessage.includes("Bad Gateway")
          ? "Hedera RPC node is currently unavailable. Please try again later."
          : errorMessage,
    });
  }
};
