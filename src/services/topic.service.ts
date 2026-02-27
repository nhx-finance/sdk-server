import { Client, TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { getSecret, Secrets } from "../config/secrets.config";
import { env } from "../config/env.config";

export async function submitMessageToTopic(message: string): Promise<void> {
  const privateKey = await getSecret(Secrets.PRIVATE_KEY);
  if (!privateKey) {
    throw new Error("Private key not found");
  }
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
