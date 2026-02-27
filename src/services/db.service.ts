import mongoose from "mongoose";
import { env } from "../config/env.config";
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = env.dbConnectionString;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}

async function connectDB() {
  try {
    await mongoose.connect(env.dbConnectionString);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

export { connectDB };
