import { Request, Response } from "express";
import {
  Role,
  StableCoinRole,
  GrantRoleRequest,
  HasRoleRequest,
  Network,
  ConnectRequest,
  SupportedWallets,
} from "@hashgraph/stablecoin-npm-sdk";
import { env } from "../config/env.config";
import { mirrorNodeConfig, rpcNodeConfig } from "../config/sdk.config";
import { getSecret, Secrets } from "../config/secrets.config";

export const grantAdminRole = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!env.tokenId) {
    res.status(400).json({
      error: "Token ID is not set in the environment variables",
    });
    return;
  }

  const { targetAccountId: rawTargetAccountId } = req.body;
  const targetAccountId = rawTargetAccountId?.trim();

  if (!targetAccountId) {
    res.status(400).json({
      error: "Missing required fields: targetAccountId",
    });
    return;
  }

  const adminPrivateKey = env.adminPrivateKey;
  if (!env.adminId || !adminPrivateKey) {
    res.status(500).json({
      error:
        "Admin credentials not configured. Please set ADMIN_ID and ADMIN_PRIVATE_KEY in .env file",
    });
    return;
  }

  console.log(`Reconnecting with admin account: ${env.adminId}`);
  await Network.connect(
    new ConnectRequest({
      account: {
        accountId: env.adminId,
        privateKey: {
          key: adminPrivateKey,
          type: env.adminKeyType,
        },
      },
      network: "testnet",
      mirrorNode: mirrorNodeConfig,
      rpcNode: rpcNodeConfig,
      wallet: SupportedWallets.CLIENT,
    }),
  );

  const adminHasRole = await Role.hasRole(
    new HasRoleRequest({
      tokenId: env.tokenId,
      targetId: env.adminId,
      role: StableCoinRole.DEFAULT_ADMIN_ROLE,
    }),
  );

  if (!adminHasRole) {
    res.status(403).json({
      error: `Admin account ${env.adminId} does not have DEFAULT_ADMIN_ROLE. Cannot grant role to others.`,
    });
    return;
  }

  console.log(
    `Granting DEFAULT_ADMIN_ROLE to ${targetAccountId} for token ${env.tokenId}`,
  );
  const result = await Role.grantRole(
    new GrantRoleRequest({
      tokenId: env.tokenId,
      targetId: targetAccountId,
      role: StableCoinRole.DEFAULT_ADMIN_ROLE,
    }),
  );

  // Reconnect with the main operational account after granting role
  const myPrivateKey = await getSecret(Secrets.PRIVATE_KEY);
  if (env.myAccountId && myPrivateKey) {
    console.log(`Reconnecting with operational account: ${env.myAccountId}`);
    await Network.connect(
      new ConnectRequest({
        account: {
          accountId: env.myAccountId,
          privateKey: {
            key: myPrivateKey,
            type: "ECDSA",
          },
        },
        network: "testnet",
        mirrorNode: mirrorNodeConfig,
        rpcNode: rpcNodeConfig,
        wallet: SupportedWallets.CLIENT,
      }),
    );
  }

  res.json({
    success: result,
    message: `DEFAULT_ADMIN_ROLE granted to ${targetAccountId}`,
  });
};

export const grantRole = async (req: Request, res: Response): Promise<void> => {
  if (!env.tokenId) {
    res
      .status(400)
      .json({ error: "Token ID is not set in the environment variables" });
    return;
  }

  const { targetAccountId: rawTargetAccountId, role: rawRole } = req.body;
  const targetAccountId = rawTargetAccountId?.trim();
  const role = rawRole?.trim();

  if (!targetAccountId || !role) {
    res
      .status(400)
      .json({ error: "Missing required fields: targetAccountId, role" });
    return;
  }

  const resolvedRole: StableCoinRole =
    role in StableCoinRole
      ? StableCoinRole[role as keyof typeof StableCoinRole]
      : (role as StableCoinRole);

  if (!Object.values(StableCoinRole).includes(resolvedRole)) {
    res.status(400).json({
      error: `Invalid role: "${role}". Valid roles are: ${Object.keys(StableCoinRole).join(", ")}`,
    });
    return;
  }

  const adminPrivateKey = env.adminPrivateKey;
  if (!env.adminId || !adminPrivateKey) {
    res.status(500).json({
      error:
        "Admin credentials not configured. Please set ADMIN_ID and ADMIN_PRIVATE_KEY in .env file",
    });
    return;
  }

  await Network.connect(
    new ConnectRequest({
      account: {
        accountId: env.adminId,
        privateKey: { key: adminPrivateKey, type: env.adminKeyType },
      },
      network: "testnet",
      mirrorNode: mirrorNodeConfig,
      rpcNode: rpcNodeConfig,
      wallet: SupportedWallets.CLIENT,
    }),
  );

  const adminHasRole = await Role.hasRole(
    new HasRoleRequest({
      tokenId: env.tokenId,
      targetId: env.adminId,
      role: StableCoinRole.DEFAULT_ADMIN_ROLE,
    }),
  );

  if (!adminHasRole) {
    res.status(403).json({
      error: `Admin account ${env.adminId} does not have DEFAULT_ADMIN_ROLE. Cannot grant roles.`,
    });
    return;
  }

  console.log(
    `Granting ${role} to ${targetAccountId} for token ${env.tokenId}`,
  );
  const result = await Role.grantRole(
    new GrantRoleRequest({
      tokenId: env.tokenId,
      targetId: targetAccountId,
      role: resolvedRole,
    }),
  );

  // Reconnect back to operational account
  const myPrivateKey = await getSecret(Secrets.PRIVATE_KEY);
  if (env.myAccountId && myPrivateKey) {
    await Network.connect(
      new ConnectRequest({
        account: {
          accountId: env.myAccountId,
          privateKey: { key: myPrivateKey, type: "ECDSA" },
        },
        network: "testnet",
        mirrorNode: mirrorNodeConfig,
        rpcNode: rpcNodeConfig,
        wallet: SupportedWallets.CLIENT,
      }),
    );
  }

  res.json({
    success: result,
    message: `${role} granted to ${targetAccountId}`,
  });
};

export const checkRole = async (req: Request, res: Response): Promise<void> => {
  if (!env.tokenId) {
    res.status(400).json({
      error: "Token ID is not set in the environment variables",
    });
    return;
  }

  const { accountId, role } = req.params;

  if (!accountId || !role) {
    res.status(400).json({
      error: "Missing required fields: accountId, role",
    });
    return;
  }

  // Accept either the enum key name (e.g. "DEFAULT_ADMIN_ROLE") or the raw hex value
  const resolvedRole: StableCoinRole =
    role in StableCoinRole
      ? StableCoinRole[role as keyof typeof StableCoinRole]
      : (role as StableCoinRole);

  if (!Object.values(StableCoinRole).includes(resolvedRole)) {
    res.status(400).json({
      error: `Invalid role: "${role}". Valid roles are: ${Object.keys(StableCoinRole).join(", ")}`,
    });
    return;
  }

  const hasRole = await Role.hasRole(
    new HasRoleRequest({
      tokenId: env.tokenId,
      targetId: accountId,
      role: resolvedRole,
    }),
  );

  res.json({ accountId, tokenId: env.tokenId, role, resolvedRole, hasRole });
};
