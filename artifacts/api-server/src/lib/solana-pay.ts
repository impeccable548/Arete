import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { logger } from "./logger";

export const DEVNET_RPC = "https://api.devnet.solana.com";
export const USDC_DEVNET_MINT = "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";

export function generateReferenceId(): string {
  return Keypair.generate().publicKey.toBase58();
}

export function buildSolanaPayUrl(params: {
  recipient: string;
  amountUsdc: number;
  referenceId: string;
  clientName: string;
}): string {
  const { recipient, amountUsdc, referenceId, clientName } = params;
  const url = new URL(`solana:${recipient}`);
  url.searchParams.set("amount", amountUsdc.toString());
  url.searchParams.set("spl-token", USDC_DEVNET_MINT);
  url.searchParams.set("reference", referenceId);
  url.searchParams.set("label", "Arete Invoice");
  url.searchParams.set("message", `Invoice for ${clientName}`);
  return url.toString();
}

export async function detectPayment(
  referenceId: string
): Promise<{ found: boolean; txSignature?: string }> {
  try {
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const referenceKey = new PublicKey(referenceId);

    const signatures = await connection.getSignaturesForAddress(referenceKey, {
      limit: 5,
    });

    if (signatures.length === 0) {
      return { found: false };
    }

    const confirmedSig = signatures.find(
      (s) => s.confirmationStatus === "confirmed" || s.confirmationStatus === "finalized"
    );

    if (!confirmedSig) {
      return { found: false };
    }

    return { found: true, txSignature: confirmedSig.signature };
  } catch (err) {
    logger.warn({ err, referenceId }, "Error detecting Solana payment");
    return { found: false };
  }
}
