import {
  StableCoin,
  WipeRequest,
  FreezeAccountRequest,
} from "@hashgraph/stablecoin-npm-sdk";
import { Request, Response } from "express";
import { env } from "../config/env.config";
import { retrySDKOperation } from "../services/sdk.service";
import { AccountId } from "@hashgraph/sdk";
import { submitMessageToTopic } from "../services/topic.service";
import Account from "../models/Accounts";

export const freezeAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!env.tokenId) {
    res.status(400).json({
      error: "Token ID is not set in the environment variables",
    });
    return;
  }
  const { accountId, freezeReason } = req.body;

  if (!accountId) {
    res.status(400).json({
      error: "Missing required fields: accountId",
    });
    return;
  }

  if (!isValidAccountId(accountId)) {
    res.status(400).json({
      error: "Invalid accountId format",
    });
    return;
  }

  if (!freezeReason) {
    res.status(400).json({
      error: "Missing required fields: freezeReason",
    });
    return;
  }

  try {
    const existingAccount = await Account.findOne({
      accountId,
      status: "frozen",
    });
    if (existingAccount) {
      res.status(409).json({
        error: "Account is already frozen",
      });
      return;
    }

    const result = await retrySDKOperation(
      () =>
        StableCoin.freeze(
          new FreezeAccountRequest({
            targetId: accountId,
            tokenId: env.tokenId,
          }),
        ),
      3,
      "Freeze account",
    );

    const evmAlias = AccountId.fromString(accountId).toEvmAddress() || "N/A";
    const topicMessage = `Account ${accountId}, evm alias ${evmAlias} frozen with reason: ${freezeReason}`;

    submitMessageToTopic(topicMessage).catch((error) => {
      console.error("Failed to submit freeze event to topic:", error);
    });

    const frozenAccount = await Account.create({
      accountId,
      evmAddress: evmAlias,
      freezeReason,
      status: "frozen",
      isWiped: false,
      frozenDate: new Date(),
    });

    res.status(200).json({
      success: result,
      frozenAccount,
      message: "Account frozen successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to freeze account",
      message: error,
    });
  }
};

export const unfreezeAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!env.tokenId) {
    res.status(400).json({
      error: "Token ID is not set in the environment variables",
    });
    return;
  }
  const { accountId, unfreezeReason } = req.body;

  if (!accountId) {
    res.status(400).json({
      error: "Missing required fields: accountId",
    });
    return;
  }

  if (!isValidAccountId(accountId)) {
    res.status(400).json({
      error: "Invalid accountId format",
    });
    return;
  }

  if (!unfreezeReason) {
    res.status(400).json({
      error: "Missing required fields: unfreezeReason",
    });
    return;
  }

  try {
    await retrySDKOperation(
      () =>
        StableCoin.unFreeze(
          new FreezeAccountRequest({
            targetId: accountId,
            tokenId: env.tokenId,
          }),
        ),
      3,
      "Unfreeze account",
    );
    const evmAlias = AccountId.fromString(accountId).toEvmAddress() || "N/A";
    const topicMessage = `Account ${accountId}, evm alias ${evmAlias} unfrozen with reason: ${unfreezeReason}`;

    submitMessageToTopic(topicMessage).catch((error) => {
      console.error("Failed to submit unfreeze event to topic:", error);
    });

    console.log("Account ID to unfreeze:", accountId);

    const unfrozenAccount = await Account.findOne({ accountId });
    console.log("Unfrozen account found in database:", unfrozenAccount);

    if (unfrozenAccount) {
      await Account.updateOne(
        { accountId },
        { $set: { status: "active", freezeReason: unfreezeReason } },
      ).catch((error) => {
        console.error("Failed to update account status in database:", error);
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Account unfrozen successfully" });
  } catch (error) {
    console.error("Failed to unfreeze account:", error);
    res.status(500).json({
      error: "Failed to unfreeze account",
      message: error,
    });
  }
};

export const wipeAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!env.tokenId) {
    res.status(400).json({
      error: "Token ID is not set in the environment variables",
    });
    return;
  }
  const { accountId, wipeReason } = req.body;

  if (!accountId) {
    res.status(400).json({
      error: "Missing required fields: accountId",
    });
    return;
  }

  if (!isValidAccountId(accountId)) {
    res.status(400).json({
      error: "Invalid accountId format",
    });
    return;
  }

  if (!wipeReason) {
    res.status(400).json({
      error: "Missing required fields: wipeReason",
    });
    return;
  }

  try {
    await retrySDKOperation(
      () =>
        StableCoin.wipe(
          new WipeRequest({
            targetId: accountId,
            tokenId: env.tokenId,
            amount: "0",
          }),
        ),
      3,
      "Wipe account",
    );
    const evmAlias = AccountId.fromString(accountId).toEvmAddress() || "N/A";
    const topicMessage = `Account ${accountId}, evm alias ${evmAlias} wiped with reason: ${wipeReason}`;

    submitMessageToTopic(topicMessage).catch((error) => {
      console.error("Failed to submit wipe event to topic:", error);
    });

    await Account.updateOne(
      { accountId },
      { $set: { status: "wiped", freezeReason: wipeReason, isWiped: true } },
    ).catch((error) => {
      console.error("Failed to update account status in database:", error);
    });

    res
      .status(200)
      .json({ success: true, message: "Account wiped successfully" });
  } catch (error) {
    console.error("Failed to wipe account:", error);
    res.status(500).json({
      error: "Failed to wipe account",
      message: error,
    });
  }
};

export const getFrozenAccounts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const frozenAccounts = await Account.find({
      status: { $in: ["frozen", "wiped"] },
    });
    res.json({ frozenAccounts });
  } catch (error) {
    console.error("Failed to retrieve frozen accounts:", error);
    res.status(500).json({
      error: "Failed to retrieve frozen accounts",
      message: error,
    });
  }
};

export const getRecentlyFrozenOrWipedAccounts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const recentFrozenOrWipedAccounts = await Account.find({
      status: { $in: ["frozen", "wiped"] },
      updatedAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // last 5 minutes, cause cre workflow runs every 5 minutes
    });
    res.json({ recentFrozenOrWipedAccounts });
  } catch (error) {
    console.error("Failed to retrieve recently frozen/wiped accounts:", error);
    res.status(500).json({
      error: "Failed to retrieve recently frozen/wiped accounts",
      message: error,
    });
  }
};

function isValidAccountId(id: string): boolean {
  try {
    AccountId.fromString(id);
    return true;
  } catch (error) {
    return false;
  }
}
