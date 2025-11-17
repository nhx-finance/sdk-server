import { Request, Response } from "express";
import {
  StableCoin,
  GetStableCoinDetailsRequest,
} from "@hashgraph/stablecoin-npm-sdk";
import { initializeSDK } from "../services/sdk.service";
import { env } from "../config/env.config";

export const getTokenInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  await initializeSDK();

  if (!env.tokenId) {
    res.status(400).json({
      error: "Token ID is not set in the environment variables",
    });
    return;
  }

  const tokenInfo = await StableCoin.getInfo(
    new GetStableCoinDetailsRequest({
      id: env.tokenId,
    })
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
};
