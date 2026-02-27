import { Request, Response } from "express";
import { StableCoin, CashInRequest } from "@hashgraph/stablecoin-npm-sdk";
import { retrySDKOperation } from "../services/sdk.service";
import { env } from "../config/env.config";

export const mint = async (req: Request, res: Response): Promise<void> => {
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

  try {
    const result = await retrySDKOperation(
      () =>
        StableCoin.cashIn(
          new CashInRequest({
            tokenId: env.tokenId,
            // Mint to a single account for now
            // TODO: Mint to a multisig account in the future
            targetId: env.accountId,
            amount,
          }),
        ),
      3,
      "Mint tokens",
    );

    res.status(200).json({ success: result, message: "Minted successfully" });
  } catch (error) {
    console.error("Error minting tokens:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: "Failed to mint tokens",
      message:
        errorMessage.includes("502") || errorMessage.includes("Bad Gateway")
          ? "Hedera RPC node is currently unavailable. Please try again later."
          : errorMessage,
    });
  }
};
