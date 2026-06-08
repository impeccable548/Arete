import { Link, useLocation } from "wouter";
import { Boxes, LayoutDashboard, Plus, Wallet, LogOut, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function truncateWallet(addr: string): string {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function WalletPanel() {
  const { wallet, isAuthenticated, isLoading, signIn, signOut, error } = useAuth();

  if (isLoading) {
    return (
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="font-mono text-xs">Checking session…</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated && wallet) {
    return (
      <div className="p-4 border-t border-border">
        <div className="px-3 py-2 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs text-primary uppercase tracking-wider">Connected</span>
          </div>
          <div className="font-mono text-xs text-muted-foreground">{truncateWallet(wallet)}</div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
          >
            <LogOut className="w-3 h-3" />
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border space-y-2">
      {error && (
        <div className="flex items-start gap-2 px-3 py-2 text-xs text-destructive bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Always show Connect Wallet — detection happens at click time */}
      <button
        onClick={signIn}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
      >
        <Wallet className="w-4 h-4 shrink-0" />
        Connect Wallet
      </button>

      {/* Download links shown below the connect button */}
      <div className="flex gap-3 px-3 pt-1">
        <a
          href="https://phantom.app/download"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Phantom
        </a>
        <a
          href="https://solflare.com/download"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Solflare
        </a>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground selection:bg-primary/30">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-card/50 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Boxes className="w-6 h-6 text-primary mr-3" />
          <span className="font-mono font-bold text-lg tracking-wider text-foreground">ARETE</span>
        </div>
        <div className="p-4 flex-1 flex flex-col gap-2">
          <Link href="/">
            <div
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                location === "/"
                  ? "bg-secondary text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </div>
          </Link>
          <Link href="/invoices/new">
            <div
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                location === "/invoices/new"
                  ? "bg-secondary text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent"
              }`}
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </div>
          </Link>
        </div>
        <WalletPanel />
      </aside>
      <main className="flex-1 flex flex-col">
        <div className="h-16 border-b border-border bg-background/95 backdrop-blur flex items-center px-8 shrink-0">
          <div className="text-sm font-mono text-muted-foreground">
            {location === "/" && "DASHBOARD / OVERVIEW"}
            {location === "/invoices/new" && "INVOICES / NEW"}
            {location.startsWith("/invoices/") && location !== "/invoices/new" && "INVOICES / DETAILS"}
          </div>
        </div>
        <div className="p-8 flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
