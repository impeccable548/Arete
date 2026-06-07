import { useParams } from "wouter";
import { useGetInvoice, useWatchInvoice, getGetInvoiceQueryKey, getListInvoicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function InvoiceDetail() {
  const params = useParams();
  const id = params.id as string;
  const { data: invoice, isLoading } = useGetInvoice(id);
  const watchInvoice = useWatchInvoice();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!invoice) return;
    navigator.clipboard.writeText(invoice.solanaPayUrl);
    setCopied(true);
    toast({ title: "Payment link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckPayment = () => {
    watchInvoice.mutate({ id }, {
      onSuccess: (data) => {
        if (data.status === "paid") {
          toast({ title: "Payment verified successfully!" });
        } else {
          toast({ title: "Payment not yet received", description: "Waiting for on-chain confirmation." });
        }
        queryClient.invalidateQueries({ queryKey: getGetInvoiceQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Invoice not found.
      </div>
    );
  }

  const isPaid = invoice.status === "paid";

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold tracking-tight">Invoice for {invoice.clientName}</h1>
            <div className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              isPaid 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
            }`}>
              {invoice.status}
            </div>
          </div>
          <p className="text-muted-foreground font-mono text-sm">REF: {invoice.referenceId}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="border border-border bg-card p-6">
            <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-4">Payment Details</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Amount Due</div>
                <div className="text-4xl font-mono text-foreground">{invoice.amountUsdc.toLocaleString()} USDC</div>
              </div>
              
              <div className="h-px bg-border my-4" />
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Recipient Wallet</div>
                <div className="font-mono text-sm break-all text-foreground">{invoice.recipientWallet}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Date Created</div>
                <div className="text-sm text-foreground">{format(new Date(invoice.createdAt), "MMM d, yyyy 'at' h:mm a")}</div>
              </div>

              {isPaid && invoice.txSignature && (
                <>
                  <div className="h-px bg-border my-4" />
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Transaction Signature</div>
                    <a href={`https://explorer.solana.com/tx/${invoice.txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs break-all text-primary hover:underline">
                      {invoice.txSignature}
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {!isPaid && (
            <div className="border border-border bg-card p-6">
              <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-4">Verification</h3>
              <p className="text-sm text-muted-foreground mb-4">Click below to check the Solana network for the payment transaction.</p>
              <Button 
                onClick={handleCheckPayment} 
                disabled={watchInvoice.isPending}
                className="w-full h-12 rounded-none bg-secondary text-foreground hover:bg-secondary/80 border border-border"
              >
                {watchInvoice.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Check Payment
              </Button>
            </div>
          )}
        </div>

        <div>
          <div className="border border-border bg-card p-8 flex flex-col items-center justify-center min-h-[400px]">
            {isPaid ? (
              <div className="flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Payment Complete</h3>
                <p className="text-muted-foreground">This invoice has been paid in full.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="bg-white p-4 mb-6 ring-1 ring-border shadow-xl">
                  <QRCodeSVG 
                    value={invoice.solanaPayUrl} 
                    size={220} 
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-6 text-center">Scan with Phantom or Backpack wallet to pay</p>
                
                <div className="w-full relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-mono">or use link</span>
                  </div>
                </div>

                <div className="mt-6 w-full flex">
                  <div className="flex-1 bg-secondary/50 border border-border border-r-0 px-3 py-2 text-xs font-mono truncate flex items-center text-muted-foreground">
                    {invoice.solanaPayUrl.substring(0, 30)}...
                  </div>
                  <Button 
                    onClick={handleCopy} 
                    variant="outline" 
                    className="rounded-none border-border hover:bg-secondary shrink-0"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
