import { Link, useLocation } from "wouter";
import { Boxes, LayoutDashboard, Plus, Settings } from "lucide-react";

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
                location === "/" ? "bg-secondary text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </div>
          </Link>
          <Link href="/invoices/new">
            <div
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                location === "/invoices/new" ? "bg-secondary text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent"
              }`}
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </div>
          </Link>
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-l-2 border-transparent">
            <Settings className="w-4 h-4" />
            Settings
          </div>
        </div>
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
