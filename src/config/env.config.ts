import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3001,
  topicId: process.env.KESY_TOPIC_ID!,
  tokenId: process.env.KESY_TOKEN_ID!,
  accountId: process.env.ACCOUNT_ID!,
  privateKey: "",
  multisigAccountId: process.env.MULTISIG_ACCOUNT_ID!,
  factoryAddress: process.env.FACTORY_ADDRESS!,
  resolverAddress: process.env.RESOLVER_ADDRESS!,
  adminId: process.env.ADMIN_ID,
  adminPrivateKey: process.env.ADMIN_PRIVATE_KEY || "",
  adminKeyType: (process.env.ADMIN_KEY_TYPE as "ED25519" | "ECDSA") || "ECDSA",
  myAccountId: process.env.MY_ACCOUNT_ID,
  myPrivateKey: "",
  apiKey: "",
  dbConnectionString: process.env.DB_URL!,
};
