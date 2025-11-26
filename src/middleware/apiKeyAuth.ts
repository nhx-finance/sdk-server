import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.config";

export function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (!env.apiKey) {
    console.warn("API_KEY not configured in environment variables");
    res.status(500).json({
      error: "API key authentication not configured",
    });
    return;
  }

  if (!apiKey) {
    res.status(401).json({
      error:
        "API key required. Please provide 'x-api-key' header or 'Authorization: Bearer <key>' header",
    });
    return;
  }

  if (apiKey !== env.apiKey) {
    res.status(403).json({
      error: "Invalid API key",
    });
    return;
  }

  next();
}
