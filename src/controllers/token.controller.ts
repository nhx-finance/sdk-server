import { Request, Response } from "express";
import {
  StableCoin,
  GetStableCoinDetailsRequest,
  TransfersRequest,
} from "@hashgraph/stablecoin-npm-sdk";
import { initializeSDK, retrySDKOperation } from "../services/sdk.service";
import { env } from "../config/env.config";

export const getTokenInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!env.tokenId) {
    res.status(400).json({
      error: "Token ID is not set in the environment variables",
    });
    return;
  }

  try {
    const tokenInfo = await retrySDKOperation(
      () =>
        StableCoin.getInfo(
          new GetStableCoinDetailsRequest({
            id: env.tokenId,
          })
        ),
      3,
      "Get token info"
    );

    const transformedTokenInfo = {
      ...tokenInfo,
      totalSupply:
        tokenInfo.totalSupply?.value?.toString() ||
        tokenInfo.totalSupply?.toString() ||
        tokenInfo.totalSupply,
      reserveAmount:
        tokenInfo.reserveAmount?.value?.toString() ||
        tokenInfo.reserveAmount?.toString() ||
        tokenInfo.reserveAmount,
    };

    res.json(transformedTokenInfo);
  } catch (error) {
    console.error("Error getting token info:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: "Failed to retrieve token information",
      message:
        errorMessage.includes("502") || errorMessage.includes("Bad Gateway")
          ? "Hedera RPC node is currently unavailable. Please try again later."
          : errorMessage,
    });
  }
};

export const transferToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!env.tokenId) {
    res.status(400).json({
      error: "Token ID is not set in the environment variables",
    });
    return;
  }

  if (!env.accountId) {
    res.status(400).json({
      error: "Account ID is not set in the environment variables",
    });
    return;
  }

  const { amount, targetAccountId } = req.body;

  if (!amount || !targetAccountId) {
    res.status(400).json({
      error: "Missing required fields: amount, targetAccountId",
    });
    return;
  }

  try {
    const result = await retrySDKOperation(
      () =>
        StableCoin.transfers(
          new TransfersRequest({
            targetsId: [targetAccountId],
            amounts: [amount.toString()],
            tokenId: env.tokenId,
            targetId: env.accountId,
          })
        ),
      3,
      "Transfer tokens"
    );
    res
      .status(200)
      .json({ success: result, message: "Transferred successfully" });
  } catch (error) {
    console.error("Error transferring tokens:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      error: "Failed to transfer tokens",
      message:
        errorMessage.includes("502") || errorMessage.includes("Bad Gateway")
          ? "Hedera RPC node is currently unavailable. Please try again later."
          : errorMessage,
    });
  }
};
