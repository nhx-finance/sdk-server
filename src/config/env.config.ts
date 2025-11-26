import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3001,
  tokenId: process.env.KESY_TOKEN_ID!,
  accountId: process.env.ACCOUNT_ID!,
  privateKey: process.env.PRIVATE_KEY!,
  multisigAccountId: process.env.MULTISIG_ACCOUNT_ID!,
  factoryAddress: process.env.FACTORY_ADDRESS!,
  resolverAddress: process.env.RESOLVER_ADDRESS!,
  adminId: process.env.ADMIN_ID,
  adminPrivateKey: process.env.ADMIN_PRIVATE_KEY,
  myAccountId: process.env.MY_ACCOUNT_ID,
  myPrivateKey: process.env.MY_PRIVATE_KEY,
  apiKey: process.env.API_KEY,
};
