import {
  Network,
  InitializationRequest,
  ConnectRequest,
  SupportedWallets,
} from "@hashgraph/stablecoin-npm-sdk";
import { mirrorNodeConfig, rpcNodeConfig } from "../config/sdk.config";
import { env } from "../config/env.config";
import { getSecret, Secrets } from "../config/secrets.config";

let sdkInitialized = false;
let sdkInitializationInProgress = false;
let sdkInitializationError: Error | null = null;

export async function initializeSDK(): Promise<void> {
  if (sdkInitialized) return;

  // If initialization is already in progress, wait for it
  if (sdkInitializationInProgress) {
    // Wait up to 30 seconds for initialization to complete
    const maxWait = 30000;
    const startTime = Date.now();
    while (sdkInitializationInProgress && Date.now() - startTime < maxWait) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (sdkInitialized) return;
    }
    if (!sdkInitialized && sdkInitializationError) {
      throw sdkInitializationError;
    }
  }

  sdkInitializationInProgress = true;
  sdkInitializationError = null;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      const privateKey = await getSecret(Secrets.PRIVATE_KEY);
      if (!privateKey) {
        throw new Error("Private key not found");
      }

      await Network.connect(
        new ConnectRequest({
          account: {
            accountId: env.accountId,
            privateKey: {
              key: privateKey,
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
      sdkInitializationError = null;
      console.log("SDK initialized and connected");
      return;
    } catch (error) {
      lastError = error as Error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check if it's a network/RPC error
      if (
        errorMessage.includes("502") ||
        errorMessage.includes("Bad Gateway") ||
        errorMessage.includes("SERVER_ERROR")
      ) {
        console.warn(
          `SDK initialization attempt ${attempt}/${maxRetries} failed due to RPC node error. Retrying...`
        );
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          continue;
        }
      }

      // For other errors, don't retry
      sdkInitialized = false;
      sdkInitializationError = lastError;
      console.error(
        `SDK initialization failed (attempt ${attempt}/${maxRetries}):`,
        error
      );
      if (attempt === maxRetries) {
        break;
      }
    }
  }

  // If we get here, all retries failed
  sdkInitialized = false;
  sdkInitializationError = lastError;
  throw lastError || new Error("SDK initialization failed after all retries");
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

/**
 * Retry wrapper for SDK operations that may fail due to RPC node issues
 */
export async function retrySDKOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  operationName: string = "SDK operation"
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check if it's a network/RPC error that we should retry
      if (
        errorMessage.includes("502") ||
        errorMessage.includes("Bad Gateway") ||
        errorMessage.includes("SERVER_ERROR") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ETIMEDOUT")
      ) {
        if (attempt < maxRetries) {
          const delay = 1000 * attempt; // Exponential backoff
          console.warn(
            `${operationName} failed (attempt ${attempt}/${maxRetries}) due to RPC error. Retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      // For non-retryable errors or final attempt, throw immediately
      throw error;
    }
  }

  throw (
    lastError ||
    new Error(`${operationName} failed after ${maxRetries} attempts`)
  );
}
