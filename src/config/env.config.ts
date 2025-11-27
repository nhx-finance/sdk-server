import dotenv from "dotenv";
import { getSecret, Secrets } from "./secrets.config";

dotenv.config();

export const env = {
  port: process.env.PORT || 3001,
  tokenId: process.env.KESY_TOKEN_ID!,
  accountId: process.env.ACCOUNT_ID!,
  privateKey: "",
  multisigAccountId: process.env.MULTISIG_ACCOUNT_ID!,
  factoryAddress: process.env.FACTORY_ADDRESS!,
  resolverAddress: process.env.RESOLVER_ADDRESS!,
  adminId: process.env.ADMIN_ID,
  adminPrivateKey: "",
  myAccountId: process.env.MY_ACCOUNT_ID,
  myPrivateKey: "",
  apiKey: "",
};
