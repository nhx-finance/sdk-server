import { Request, Response, NextFunction } from "express";
import { getSecret, Secrets } from "../config/secrets.config";

export async function apiKeyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");

  const secretApiKey = await getSecret(Secrets.API_KEY);
  if (!secretApiKey) {
    console.warn("API key not found");
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

  if (apiKey !== secretApiKey) {
    res.status(403).json({
      error: "Invalid API key",
    });
    return;
  }

  next();
}
