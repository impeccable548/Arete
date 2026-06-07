import { useListInvoices, useGetInvoiceStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowUpRight, Plus, Loader2, Wallet } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

function ConnectPrompt() {
  const { signIn, isLoading, walletDetected } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Wallet className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Connect your wallet</h2>
        <p className="text-muted-foreground max-w-sm">
          Sign in with your Solana wallet to create invoices and track on-chain payments.
        </p>
      </div>
      {walletDetected ? (
        <button
          onClick={signIn}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      ) : (
        <a
          href="https://phantom.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
        >
          Get Phantom Wallet
        </a>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetInvoiceStats();
  const { data: invoices, isLoading: invoicesLoading } = useListInvoices();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ConnectPrompt />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time metrics for your on-chain business.</p>
        </div>
        <Link href="/invoices/new">
          <div className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </div>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border bg-card p-6 h-[116px] flex flex-col justify-between animate-pulse">
              <div className="h-4 bg-muted w-1/3" />
              <div className="h-8 bg-muted w-1/2" />
            </div>
          ))
        ) : (
          <>
            <StatCard title="Total USDC Paid" value={`$${stats?.totalPaidUsdc?.toLocaleString() ?? 0}`} trend="+ USDC collected" />
            <StatCard title="Pending USDC" value={`$${stats?.totalPendingUsdc?.toLocaleString() ?? 0}`} trend="Awaiting payment" />
            <StatCard title="Total Invoices" value={stats?.totalInvoices ?? 0} />
            <StatCard title="Paid vs Pending" value={`${stats?.paidInvoices ?? 0} / ${stats?.pendingInvoices ?? 0}`} />
          </>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Recent Invoices</h2>
        <div className="border border-border bg-card">
          <div className="w-full overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="h-12 px-4 font-mono font-medium">CLIENT</th>
                  <th className="h-12 px-4 font-mono font-medium">AMOUNT</th>
                  <th className="h-12 px-4 font-mono font-medium">STATUS</th>
                  <th className="h-12 px-4 font-mono font-medium">CREATED</th>
                  <th className="h-12 px-4 text-right font-mono font-medium">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {invoicesLoading ? (
                  <tr>
                    <td colSpan={5} className="h-32 text-center text-muted-foreground">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    </td>
                  </tr>
                ) : !invoices || invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-32 text-center text-muted-foreground">
                      No invoices yet.{" "}
                      <Link href="/invoices/new">
                        <span className="text-primary underline cursor-pointer">Create your first one.</span>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border transition-colors hover:bg-muted/50 last:border-0 group">
                      <td className="p-4 align-middle font-medium text-foreground">{invoice.clientName}</td>
                      <td className="p-4 align-middle font-mono">{invoice.amountUsdc.toLocaleString()} USDC</td>
                      <td className="p-4 align-middle">
                        <div className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                          invoice.status === "paid"
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                        }`}>
                          {invoice.status}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Link href={`/invoices/${invoice.id}`}>
                          <div className="inline-flex items-center justify-center p-2 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend }: { title: string; value: string | number; trend?: string }) {
  return (
    <div className="border border-border bg-card p-6 flex flex-col justify-between">
      <div className="text-sm font-mono text-muted-foreground mb-4">{title}</div>
      <div>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {trend && <div className="text-xs text-muted-foreground mt-1">{trend}</div>}
      </div>
    </div>
  );
}
