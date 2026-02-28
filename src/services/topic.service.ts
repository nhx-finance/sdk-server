import {
  Client,
  PrivateKey,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import { getSecret, Secrets } from "../config/secrets.config";
import { env } from "../config/env.config";

export async function submitMessageToTopic(message: string): Promise<void> {
  const rawKey = await getSecret(Secrets.PRIVATE_KEY);
  if (!rawKey) {
    throw new Error("Private key not found");
  }
  const privateKey = PrivateKey.fromStringECDSA(rawKey);
  const client = Client.forTestnet();
  client.setOperator(env.accountId, privateKey);
  try {
    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(env.topicId)
      .setMessage(message);
    const response = await transaction.execute(client);
    console.log("Message submitted:", response);
  } catch (error) {
    console.error("Error submitting message:", error);
    throw error;
  }
}
