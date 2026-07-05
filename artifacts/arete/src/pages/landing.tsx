import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Boxes,
  Wallet,
  QrCode,
  Zap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

function Nav() {
  const { isAuthenticated, signIn, isLoading } = useAuth();
  const [, navigate] = useLocation();

  const handleLaunch = async () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      const success = await signIn();
      if (success) navigate("/dashboard");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Boxes className="w-6 h-6 text-primary" />
          <span className="font-mono font-bold text-lg tracking-wider">ARETE</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#preview" className="hover:text-foreground transition-colors">Preview</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLaunch}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Wallet className="w-4 h-4" />
            {isAuthenticated ? "Open App" : "Launch App"}
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroInvoiceCard() {
  return (
    <div className="landing-float relative w-full max-w-sm mx-auto">
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75 translate-y-8" />
      {/* Main card */}
      <div className="relative border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs text-muted-foreground tracking-wider">ARETE INVOICE</span>
          </div>
          <div className="px-2 py-0.5 text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-mono">
            PENDING
          </div>
        </div>
        <div className="mb-5">
          <div className="text-xs text-muted-foreground mb-1">Amount due</div>
          <div className="text-3xl font-mono font-bold text-foreground">2,500 <span className="text-primary text-lg">USDC</span></div>
        </div>
        <div className="h-px bg-border mb-5" />
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Client</div>
            <div className="text-sm font-medium">Acme Corp</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Date</div>
            <div className="text-sm font-medium">Jun 11, 2026</div>
          </div>
        </div>
        {/* Fake QR */}
        <div className="bg-white p-3 w-20 h-20 mx-auto grid grid-cols-5 gap-px opacity-80">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className={`${[0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,12,18,7,11,17].includes(i) ? "bg-black" : "bg-white"}`} />
          ))}
        </div>
        <div className="text-center mt-3 text-xs text-muted-foreground font-mono">Scan to pay via Solana Pay</div>
      </div>
      {/* Paid badge floating */}
      <div className="absolute -top-4 -right-4 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold shadow-lg landing-float-delayed">
        <CheckCircle2 className="w-3 h-3" />
        PAID ON-CHAIN
      </div>
    </div>
  );
}

const features = [
  {
    icon: QrCode,
    title: "Solana Pay QR Codes",
    description: "Every invoice generates a Solana Pay URL and scannable QR code. Clients pay in one tap with Phantom or any Solana wallet.",
  },
  {
    icon: Zap,
    title: "Real-time On-chain Detection",
    description: "No webhooks, no middlemen. Arete polls the Solana devnet directly and marks invoices as paid the moment the transaction confirms.",
  },
  {
    icon: ShieldCheck,
    title: "Sign In With Solana",
    description: "Wallet-native authentication. No passwords, no emails — just sign a message and your invoices are yours, protected on-chain.",
  },
  {
    icon: Wallet,
    title: "USDC Invoicing",
    description: "Issue invoices in USDC, the most liquid stablecoin on Solana. Freelancers get paid in dollars, settled on-chain in seconds.",
  },
];

const steps = [
  {
    n: "01",
    title: "Connect your wallet",
    desc: "Sign in with Phantom or Solflare using Sign In With Solana — no account creation required.",
  },
  {
    n: "02",
    title: "Create an invoice",
    desc: "Enter the client name, USDC amount, and your recipient wallet. Arete generates a unique Solana Pay link instantly.",
  },
  {
    n: "03",
    title: "Get paid on-chain",
    desc: "Share the QR code or link. When the client pays, Arete detects it on Solana devnet and marks the invoice as paid.",
  },
];
// App preview mock — mimics the dashboard UI
function AppPreview() {
  return (
    <div className="border border-border bg-card overflow-hidden shadow-2xl">
      {/* Fake browser chrome */}
      <div className="border-b border-border bg-secondary/30 px-4 py-2 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <div className="flex-1 mx-4 bg-secondary rounded px-3 py-1 text-xs text-muted-foreground font-mono truncate">
          arete.app/dashboard
        </div>
      </div>
      {/* App layout mockup */}
      <div className="flex h-64 md:h-80">
        {/* Sidebar */}
        <div className="w-40 border-r border-border bg-card/50 flex flex-col shrink-0">
          <div className="h-10 border-b border-border flex items-center px-4 gap-2">
            <Boxes className="w-3 h-3 text-primary" />
            <span className="font-mono text-xs font-bold text-primary">ARETE</span>
          </div>
          <div className="p-2 flex-1 space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-secondary border-l-2 border-primary text-xs font-medium text-primary">
              <div className="w-2 h-2 bg-primary/60" />
              Dashboard
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-muted" />
              New Invoice
            </div>
          </div>
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary font-mono">Connected</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">Gx8k…m4Qr</div>
          </div>
        </div>
        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-10 border-b border-border flex items-center px-6">
            <span className="text-xs font-mono text-muted-foreground">DASHBOARD / OVERVIEW</span>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-hidden">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Total Earned", value: "7,500 USDC" },
                { label: "Pending", value: "2,500 USDC" },
                { label: "Invoices", value: "4" },
              ].map((s) => (
                <div key={s.label} className="border border-border bg-background/50 p-2">
                  <div className="text-xs text-muted-foreground mb-0.5">{s.label}</div>
                  <div className="text-xs font-mono font-bold text-foreground">{s.value}</div>
                </div>
              ))}
            </div>
            {/* Invoice rows */}
            {[
              { client: "Acme Corp", amount: "2,500", status: "paid" },
              { client: "BuildCo", amount: "3,000", status: "paid" },
              { client: "DevDAO", amount: "2,000", status: "pending" },
            ].map((inv) => (
              <div key={inv.client} className="flex items-center justify-between border border-border px-3 py-2 bg-background/30">
                <span className="text-xs font-medium text-foreground">{inv.client}</span>
                <span className="text-xs font-mono text-muted-foreground">{inv.amount} USDC</span>
                <div className={`text-xs px-2 py-0.5 font-mono font-semibold ${
                  inv.status === "paid"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                }`}>
                  {inv.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { isAuthenticated, signIn, isLoading } = useAuth();
  const [, navigate] = useLocation();

  const handleLaunch = async () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      const success = await signIn();
      if (success) navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />

      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center pt-16 relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 landing-grid-bg opacity-30" />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 w-full py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — text */}
            <div className="landing-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-8 landing-fade-up">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                LIVE ON SOLANA DEVNET
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                Invoicing<br />
                <span className="text-primary">for the</span><br />
                onchain era.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md">
                Create crypto invoices, generate Solana Pay QR codes, and detect USDC payments on-chain — all from your wallet.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleLaunch}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-8 h-13 bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all hover:gap-3 disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" />
                  {isAuthenticated ? "Open Dashboard" : "Connect Wallet"}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-2 px-8 h-13 border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
                >
                  See how it works
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                No account required · Works with Phantom & Solflare
              </p>
            </div>
            {/* Right — floating invoice card */}
            <div className="landing-fade-up-delayed">
              <HeroInvoiceCard />
            </div>
          </div>
        </div>
      </section>
      {/* ── Features ── */}
      <section id="features" className="py-32 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 landing-fade-up">
            <div className="text-xs font-mono text-primary tracking-widest mb-4">FEATURES</div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Everything you need to get paid</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">No banks. No SWIFT. No waiting. Just wallets, QR codes, and on-chain confirmation.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="border border-border bg-card p-6 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 border border-border bg-background flex items-center justify-center mb-5 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-32 border-t border-border bg-card/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-primary tracking-widest mb-4">HOW IT WORKS</div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Three steps to your first crypto invoice</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.n} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px border-t border-dashed border-border -translate-x-4 z-0" />
                )}
                <div className="relative z-10">
                  <div className="font-mono text-5xl font-bold text-primary/20 mb-4">{step.n}</div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Preview ── */}
      <section id="preview" className="py-32 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs font-mono text-primary tracking-widest mb-4">APP PREVIEW</div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Clean, minimal, built for focus</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every invoice at a glance. Connect once, create as many as you need.
            </p>
          </div>
          <div className="landing-fade-up max-w-4xl mx-auto">
            <AppPreview />
          </div>

          {/* Workflow steps below preview */}
          <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
            {[
              { step: "Create", label: "Fill in client, amount, wallet", icon: "01" },
              { step: "Share", label: "QR code + Solana Pay link", icon: "02" },
              { step: "Detect", label: "On-chain confirmation, instant", icon: "03" },
            ].map((w) => (
              <div key={w.step} className="border border-border bg-card p-4 flex items-center gap-4">
                <div className="font-mono text-2xl font-bold text-primary/30">{w.icon}</div>
                <div>
                  <div className="font-semibold text-sm">{w.step}</div>
                  <div className="text-xs text-muted-foreground">{w.label}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 border-t border-border bg-card/20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="text-xs font-mono text-primary tracking-widest mb-6">GET STARTED</div>
          <h2 className="text-5xl font-bold tracking-tight mb-6">Ready to get paid on-chain?</h2>
          <p className="text-muted-foreground text-lg mb-10">
            Connect your Solana wallet and send your first crypto invoice in under two minutes.
          </p>
          <button
            onClick={handleLaunch}
            disabled={isLoading}
            className="inline-flex items-center gap-3 px-10 h-14 bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Wallet className="w-5 h-5" />
            {isAuthenticated ? "Go to Dashboard" : "Connect Wallet & Start"}
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground mt-4">
            Don't have a wallet?{" "}
            <a href="https://phantom.app/download" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Phantom</a>
            {" or "}
            <a href="https://solflare.com/download" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Solflare</a>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Boxes className="w-5 h-5 text-primary" />
            <span className="font-mono font-bold tracking-wider text-foreground">ARETE</span>
            <span className="text-xs text-muted-foreground font-mono ml-2">Web3 Invoicing · Solana Devnet</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <a
              href="https://solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              Solana <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://explorer.solana.com/?cluster=devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}