import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

type SolanaProvider = {
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array } | Uint8Array>;
  isConnected: boolean;
  publicKey: { toBase58: () => string } | null;
};

declare global {
  interface Window {
    phantom?: { solana?: SolanaProvider };
    solflare?: SolanaProvider & { isSolflare?: boolean };
  }
}

function getProvider(): SolanaProvider | null {
  if (window.phantom?.solana?.isConnected !== undefined) return window.phantom.solana;
  if (window.solflare?.isSolflare) return window.solflare;
  return null;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type AuthState = {
  wallet: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  walletDetected: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletDetected, setWalletDetected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const detected = !!(window.phantom?.solana || window.solflare?.isSolflare);
    setWalletDetected(detected);

    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.wallet) setWallet(data.wallet);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    const provider = getProvider();
    if (!provider) {
      setError("No Solana wallet found. Install Phantom or Solflare.");
      return;
    }

    try {
      setIsLoading(true);
      const { publicKey } = await provider.connect();
      const pubkeyStr = publicKey.toBase58();

      const nonceRes = await fetch(`/api/auth/nonce?wallet=${pubkeyStr}`, {
        credentials: "include",
      });
      if (!nonceRes.ok) throw new Error("Failed to get nonce");
      const { nonce } = await nonceRes.json();

      const message = `Sign in to Arete\nNonce: ${nonce}`;
      const messageBytes = new TextEncoder().encode(message);
      const result = await provider.signMessage(messageBytes, "utf8");
      const sigBytes = result instanceof Uint8Array ? result : (result as { signature: Uint8Array }).signature;
      const signatureHex = toHex(sigBytes);

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ wallet: pubkeyStr, signature: signatureHex, nonce }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || "Verification failed");
      }

      const data = await verifyRes.json();
      setWallet(data.wallet);
      queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setWallet(null);
    queryClient.clear();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        wallet,
        isAuthenticated: !!wallet,
        isLoading,
        walletDetected,
        signIn,
        signOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
