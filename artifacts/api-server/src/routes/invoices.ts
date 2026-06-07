import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";
import {
  buildSolanaPayUrl,
  detectPayment,
  generateReferenceId,
} from "../lib/solana-pay";
import { requireAuth } from "../middlewares/auth";
import {
  CreateInvoiceBody,
  GetInvoiceParams,
  WatchInvoiceParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/invoices", requireAuth, async (req, res): Promise<void> => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("owner_wallet", req.wallet!)
    .order("created_at", { ascending: false });

  if (error) {
    req.log.error({ error }, "Failed to list invoices");
    res.status(500).json({ error: "Failed to fetch invoices" });
    return;
  }

  res.json((data ?? []).map(toInvoice));
});

router.post("/invoices", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateInvoiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { clientName, amountUsdc, recipientWallet } = parsed.data;
  const referenceId = generateReferenceId();
  const solanaPayUrl = buildSolanaPayUrl({
    recipient: recipientWallet,
    amountUsdc,
    referenceId,
    clientName,
  });

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      client_name: clientName,
      amount_usdc: amountUsdc,
      recipient_wallet: recipientWallet,
      reference_id: referenceId,
      solana_pay_url: solanaPayUrl,
      status: "pending",
      owner_wallet: req.wallet!,
    })
    .select()
    .single();

  if (error) {
    req.log.error({ error }, "Failed to create invoice");
    res.status(500).json({ error: "Failed to create invoice" });
    return;
  }

  res.status(201).json(toInvoice(data));
});

router.get("/invoices/stats", requireAuth, async (req, res): Promise<void> => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("owner_wallet", req.wallet!);

  if (error) {
    req.log.error({ error }, "Failed to fetch invoice stats");
    res.status(500).json({ error: "Failed to fetch stats" });
    return;
  }

  const invoices = data ?? [];
  const paid = invoices.filter((i) => i.status === "paid");
  const pending = invoices.filter((i) => i.status === "pending");

  res.json({
    totalInvoices: invoices.length,
    paidInvoices: paid.length,
    pendingInvoices: pending.length,
    totalPaidUsdc: paid.reduce((sum, i) => sum + Number(i.amount_usdc), 0),
    totalPendingUsdc: pending.reduce((sum, i) => sum + Number(i.amount_usdc), 0),
  });
});

router.get("/invoices/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetInvoiceParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", params.data.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  res.json(toInvoice(data));
});

router.post("/invoices/:id/watch", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = WatchInvoiceParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { data: invoice, error: fetchErr } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", params.data.id)
    .single();

  if (fetchErr || !invoice) {
    res.status(404).json({ error: "Invoice not found" });
    return;
  }

  if (invoice.status === "paid") {
    res.json(toInvoice(invoice));
    return;
  }

  const { found, txSignature } = await detectPayment(invoice.reference_id);

  if (!found) {
    res.json(toInvoice(invoice));
    return;
  }

  const { data: updated, error: updateErr } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      tx_signature: txSignature,
      paid_at: new Date().toISOString(),
    })
    .eq("id", params.data.id)
    .select()
    .single();

  if (updateErr || !updated) {
    req.log.error({ updateErr }, "Failed to update invoice status");
    res.status(500).json({ error: "Failed to update invoice" });
    return;
  }

  res.json(toInvoice(updated));
});

function toInvoice(row: Record<string, unknown>) {
  return {
    id: row.id,
    clientName: row.client_name,
    amountUsdc: Number(row.amount_usdc),
    recipientWallet: row.recipient_wallet,
    referenceId: row.reference_id,
    ownerWallet: row.owner_wallet,
    status: row.status,
    solanaPayUrl: row.solana_pay_url,
    txSignature: row.tx_signature ?? null,
    createdAt: row.created_at,
    paidAt: row.paid_at ?? null,
  };
}

export default router;
