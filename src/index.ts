import app from "./app";
import { env } from "./config/env.config";
import { initializeSDK } from "./services/sdk.service";
import { connectDB } from "./services/db.service";

const PORT = env.port;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await initializeSDK();
    await connectDB();
  } catch (error) {
    console.error("Failed to initialize SDK on startup:", error);
  }
});
