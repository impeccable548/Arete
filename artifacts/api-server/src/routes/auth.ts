import { Router, type IRouter } from "express";
import { randomBytes } from "crypto";
import { supabase } from "../lib/supabase";
import { verifySignature, signJwt, COOKIE_NAME, COOKIE_OPTS } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";
import { GetNonceQueryParams, VerifyWalletBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/auth/nonce", async (req, res): Promise<void> => {
  const parsed = GetNonceQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "wallet query param required" });
    return;
  }

  const { wallet } = parsed.data;
  const nonce = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  await supabase.from("nonces").delete().eq("wallet", wallet);

  const { error } = await supabase
    .from("nonces")
    .insert({ wallet, nonce, expires_at: expiresAt });

  if (error) {
    req.log.error({ error }, "Failed to store nonce");
    res.status(500).json({ error: "Failed to generate nonce" });
    return;
  }

  res.json({ nonce });
});

router.post("/auth/verify", async (req, res): Promise<void> => {
  const parsed = VerifyWalletBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { wallet, signature, nonce } = parsed.data;

  const { data: nonceRow, error: fetchErr } = await supabase
    .from("nonces")
    .select("*")
    .eq("wallet", wallet)
    .eq("nonce", nonce)
    .single();

  if (fetchErr || !nonceRow) {
    res.status(401).json({ error: "Invalid or expired nonce" });
    return;
  }

  if (new Date(nonceRow.expires_at) < new Date()) {
    await supabase.from("nonces").delete().eq("id", nonceRow.id);
    res.status(401).json({ error: "Nonce expired — please try again" });
    return;
  }

  const valid = verifySignature({ wallet, signatureHex: signature, nonce });

  if (!valid) {
    req.log.warn({ wallet }, "Invalid wallet signature");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  await supabase.from("nonces").delete().eq("id", nonceRow.id);

  const token = signJwt(wallet);

  // Set httpOnly cookie for desktop browsers
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);

  // Also return the token in the body so mobile WebViews (Phantom browser)
  // can use localStorage + Authorization: Bearer instead of cookies
  res.json({ wallet, token });
});

router.get("/auth/me", requireAuth, (req, res): void => {
  res.json({ wallet: req.wallet });
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.status(204).send();
});

export default router;
