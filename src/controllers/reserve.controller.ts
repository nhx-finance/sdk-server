import { Request, Response } from "express";
import {
  StableCoin,
  ReserveDataFeed,
  GetReserveAddressRequest,
  UpdateReserveAmountRequest,
  GetReserveAmountRequest,
} from "@hashgraph/stablecoin-npm-sdk";
import { initializeSDK } from "../services/sdk.service";
import { env } from "../config/env.config";

export const updateReserve = async (
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

  const { reserveAmount } = req.body;

  if (!reserveAmount) {
    res.status(400).json({
      error: "Missing required fields: reserveAmount",
    });
    return;
  }

  const reserveAddress = await StableCoin.getReserveAddress(
    new GetReserveAddressRequest({
      tokenId: env.tokenId,
    })
  );

  if (!reserveAddress || reserveAddress === "0.0.0") {
    res.status(400).json({
      error: "Token does not have a reserve address configured",
    });
    return;
  }

  const result = await ReserveDataFeed.updateReserveAmount(
    new UpdateReserveAmountRequest({
      reserveAddress: reserveAddress,
      reserveAmount: reserveAmount.toString(),
    })
  );

  res.json({ success: result });
};

export const getReserve = async (
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

  const reserveAmount = await ReserveDataFeed.getReserveAmount(
    new GetReserveAmountRequest({
      tokenId: env.tokenId,
    })
  );

  res.json({ reserveAmount: reserveAmount.value.toString() });
};
