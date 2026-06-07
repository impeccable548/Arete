import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { logger } from "./logger";

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  logger.error("SESSION_SECRET must be set");
  process.exit(1);
}

const JWT_EXPIRY = "7d";
export const COOKIE_NAME = "arete_session";

export const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export function buildSignMessage(nonce: string): string {
  return `Sign in to Arete\nNonce: ${nonce}`;
}

export function verifySignature(params: {
  wallet: string;
  signatureHex: string;
  nonce: string;
}): boolean {
  try {
    const { wallet, signatureHex, nonce } = params;
    const message = buildSignMessage(nonce);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = new Uint8Array(Buffer.from(signatureHex, "hex"));
    const publicKeyBytes = new Uint8Array(bs58.decode(wallet));
    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (err) {
    logger.warn({ err }, "Signature verification failed");
    return false;
  }
}

export function signJwt(wallet: string): string {
  return jwt.sign({ wallet }, SESSION_SECRET!, { expiresIn: JWT_EXPIRY });
}

export function verifyJwt(token: string): { wallet: string } | null {
  try {
    const payload = jwt.verify(token, SESSION_SECRET!) as { wallet: string };
    return { wallet: payload.wallet };
  } catch {
    return null;
  }
}
