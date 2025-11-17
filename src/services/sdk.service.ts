import {
  Network,
  InitializationRequest,
  ConnectRequest,
  SupportedWallets,
} from "@hashgraph/stablecoin-npm-sdk";
import { mirrorNodeConfig, rpcNodeConfig } from "../config/sdk.config";
import { env } from "../config/env.config";

let sdkInitialized = false;

export async function initializeSDK(): Promise<void> {
  if (sdkInitialized) return;

  try {
    await Network.init(
      new InitializationRequest({
        network: "testnet",
        mirrorNode: mirrorNodeConfig,
        rpcNode: rpcNodeConfig,
        configuration: {
          factoryAddress: env.factoryAddress,
          resolverAddress: env.resolverAddress,
        },
      })
    );

    await Network.connect(
      new ConnectRequest({
        account: {
          accountId: env.accountId,
          privateKey: {
            key: env.privateKey,
            type: "ECDSA",
          },
        },
        network: "testnet",
        mirrorNode: mirrorNodeConfig,
        rpcNode: rpcNodeConfig,
        wallet: SupportedWallets.CLIENT,
      })
    );

    sdkInitialized = true;
    console.log("SDK initialized and connected");
  } catch (error) {
    console.error(
      "SDK initialization failed, check your environment variables",
      error
    );
    throw error;
  }
}

export async function connectWithAccount(
  accountId: string,
  privateKey: string,
  keyType: "ECDSA" | "ED25519" = "ED25519"
): Promise<void> {
  await Network.connect(
    new ConnectRequest({
      account: {
        accountId,
        privateKey: {
          key: privateKey,
          type: keyType,
        },
      },
      network: "testnet",
      mirrorNode: mirrorNodeConfig,
      rpcNode: rpcNodeConfig,
      wallet: SupportedWallets.CLIENT,
    })
  );
}

export function getSDKInitializedStatus(): boolean {
  return sdkInitialized;
}
