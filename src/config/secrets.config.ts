import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

// Initialize client with credentials from environment variable
let client: SecretManagerServiceClient;

try {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (credentialsJson) {
    // Parse the JSON credentials from environment variable
    const credentials = JSON.parse(credentialsJson);
    client = new SecretManagerServiceClient({
      credentials: credentials,
    });
    console.log(
      "Google Secret Manager client initialized with credentials from environment"
    );
  } else {
    // Fallback to default credentials (for local development)
    console.warn(
      "GOOGLE_APPLICATION_CREDENTIALS_JSON not set, using default credentials"
    );
    client = new SecretManagerServiceClient();
  }
} catch (error) {
  console.error("Error initializing Google Secret Manager client:", error);
  if (error instanceof SyntaxError) {
    console.error(
      "Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON. Ensure it's valid JSON."
    );
  }
  // Fallback to default credentials
  client = new SecretManagerServiceClient();
}

// Cache to avoid repeated API calls
const secretCache = new Map<string, string>();

export async function getSecret(secretId: string): Promise<string> {
  const cacheKey = secretId;
  if (secretCache.has(cacheKey)) {
    return secretCache.get(cacheKey)!;
  }

  const projectId = process.env.GCP_PROJECT_ID;
  if (!projectId) {
    throw new Error("GCP_PROJECT_ID is not set");
  }
  const name = `projects/${projectId}/secrets/${secretId}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString("utf8");

    if (!payload) {
      throw new Error(`Secret payload not found for ${secretId}`);
    }

    secretCache.set(cacheKey, payload);
    return payload;
  } catch (error) {
    console.error(`Error accessing secret ${secretId}:`, error);
    throw new Error(`Failed to retrieve secret: ${secretId}`);
  }
}

export enum Secrets {
  PRIVATE_KEY = "PRIVATE_KEY",
  API_KEY = "API_KEY",
}
