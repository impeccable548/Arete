import { Request, Response, NextFunction } from "express";
import { verifyJwt, COOKIE_NAME } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      wallet?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token =
    req.cookies?.[COOKIE_NAME] ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const payload = verifyJwt(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }

  req.wallet = payload.wallet;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token =
    req.cookies?.[COOKIE_NAME] ||
    req.headers.authorization?.replace("Bearer ", "");

  if (token) {
    const payload = verifyJwt(token);
    if (payload) req.wallet = payload.wallet;
  }
  next();
}
