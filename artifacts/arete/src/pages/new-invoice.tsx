import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateInvoice } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  amountUsdc: z.coerce.number().min(0.01, "Amount must be at least 0.01"),
  recipientWallet: z.string().min(32, "Invalid Solana wallet address").max(44, "Invalid Solana wallet address"),
});

export default function NewInvoice() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading, signIn, walletDetected } = useAuth();
  const createInvoice = useCreateInvoice();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      amountUsdc: 0,
      recipientWallet: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createInvoice.mutate(
      { data: values },
      {
        onSuccess: (invoice) => {
          setLocation(`/invoices/${invoice.id}`);
        },
      },
    );
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">Generate a Solana Pay link for your client.</p>
        </div>
        <div className="border border-border bg-card p-12 flex flex-col items-center text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Wallet required</h3>
            <p className="text-sm text-muted-foreground">Connect your Solana wallet to create invoices.</p>
          </div>
          {walletDetected ? (
            <Button onClick={signIn} className="rounded-none h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          ) : (
            <a
              href="https://phantom.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              Get Phantom Wallet
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Create Invoice</h1>
        <p className="text-muted-foreground mt-1">Generate a Solana Pay link for your client.</p>
      </div>

      <div className="border border-border bg-card p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" className="h-12 bg-secondary/30 rounded-none border-border focus-visible:ring-primary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountUsdc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Amount (USDC)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="100.00"
                        className="h-12 bg-secondary/30 rounded-none border-border font-mono text-lg focus-visible:ring-primary pl-4 pr-16"
                        {...field}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">USDC</div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientWallet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Recipient Wallet (Solana)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your Solana devnet wallet address"
                      className="h-12 bg-secondary/30 rounded-none border-border font-mono focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={createInvoice.isPending}
                className="h-12 px-8 rounded-none font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {createInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Payment Link
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
