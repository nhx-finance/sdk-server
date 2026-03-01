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
import { mirrorNodeConfig } from "../config/sdk.config";

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

    const evmAlias = await getEvmAliasFromMirrorNode(accountId);
    const topicMessage = `Account ${accountId}, evm alias ${evmAlias} frozen with reason: ${freezeReason}`;

    submitMessageToTopic(topicMessage).catch((error) => {
      console.error("Failed to submit freeze event to topic:", error);
    });

    //check if account exists in db as active before creating a new frozen account record
    const activeAccount = await Account.findOne({
      accountId,
      status: "active",
    });

    if (activeAccount) {
      await Account.updateOne(
        { accountId },
        { $set: { status: "frozen", freezeReason, frozenDate: new Date() } },
      ).catch((error) => {
        console.error("Failed to update account status in database:", error);
      });

      res.status(200).json({
        success: result,
        frozenAccount: activeAccount,
        evmAlias,
        message: "Account frozen successfully",
      });
      return;
    }

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

  const unfrozenAccount = await Account.findOne({ accountId });
  if (!unfrozenAccount || unfrozenAccount.status !== "frozen") {
    console.warn(
      "Account not found in database or not frozen, cannot update status to active",
    );
    res.status(404).json({
      error: "Account not found or not frozen in database",
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
    const evmAlias = await getEvmAliasFromMirrorNode(accountId);
    const topicMessage = `Account ${accountId}, evm alias ${evmAlias} unfrozen with reason: ${unfreezeReason}`;

    submitMessageToTopic(topicMessage).catch((error) => {
      console.error("Failed to submit unfreeze event to topic:", error);
    });

    console.log("Account ID to unfreeze:", accountId);

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
    const evmAlias = await getEvmAliasFromMirrorNode(accountId);
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

interface MirrorNodeTokenBalance {
  token_id: string;
  balance: number;
}

interface MirrorNodeAccountBalance {
  balance: number;
  timestamp: string;
  tokens: MirrorNodeTokenBalance[];
}

interface MirrorNodeAccountKey {
  _type: string;
  key: string;
}

interface MirrorNodeAccountLinks {
  next: string | null;
}

interface MirrorNodeAccountResponse {
  account: string;
  alias: string;
  auto_renew_period: number;
  balance: MirrorNodeAccountBalance;
  created_timestamp: string;
  decline_reward: boolean;
  deleted: boolean;
  ethereum_nonce: number;
  evm_address: string;
  expiry_timestamp: string;
  key: MirrorNodeAccountKey;
  max_automatic_token_associations: number;
  memo: string;
  pending_reward: number;
  receiver_sig_required: boolean;
  staked_account_id: string | null;
  staked_node_id: number | null;
  stake_period_start: string | null;
  transactions: unknown[];
  links: MirrorNodeAccountLinks;
}

function isValidAccountId(id: string): boolean {
  try {
    AccountId.fromString(id);
    return true;
  } catch (error) {
    return false;
  }
}

async function getEvmAliasFromMirrorNode(accountId: string): Promise<string> {
  try {
    const url = `${mirrorNodeConfig.baseUrl}accounts/${accountId}?limit=1&order=asc&transactions=false`;
    console.log("Fetching account details from Mirror Node:", url);
    const response = await fetch(url, {
      method: "GET",
      headers: mirrorNodeConfig.apiKey
        ? { [mirrorNodeConfig.headerName]: mirrorNodeConfig.apiKey }
        : {},
    });

    if (!response.ok) {
      throw new Error(
        `Mirror Node API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as MirrorNodeAccountResponse;
    return data.evm_address || "N/A";
  } catch (error) {
    console.error("Failed to retrieve EVM alias from Mirror Node:", error);
    return "N/A";
  }
}
