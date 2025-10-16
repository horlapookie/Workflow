import { Request, Response, NextFunction } from "express";
import { validateApiKey } from "../apikeys";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  keyId?: string;
  authMethod?: "session" | "apikey";
}

export async function apiKeyAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    
    const result = await validateApiKey(token);
    
    if (result.valid && result.userId) {
      req.userId = result.userId;
      req.keyId = result.keyId;
      req.authMethod = "apikey";
      return next();
    }
    
    return res.status(401).json({ message: "Invalid or expired API key" });
  }

  if (req.session?.userId) {
    req.userId = req.session.userId;
    req.authMethod = "session";
    return next();
  }

  return res.status(401).json({ message: "Authentication required. Provide session or Bearer token." });
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = req.session?.userId || req.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  req.userId = userId;
  next();
}
