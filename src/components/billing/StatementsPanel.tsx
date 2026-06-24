import { cn } from "@/lib/utils";
import { Check, ChevronRight, Clock, AlertTriangle, Send } from "lucide-react";
import { BILLING_MONTH, CYCLE_STATS as INITIAL_CYCLE_STATS, type ResidentBilling, type StatementStatus } from "@/lib/mock/billing";

const CYCLE_STAGES = [
  { key: "chargesPosted", label: "Charges Posted" },
  { key: "generated", label: "Generated" },
  { key: "reviewed", label: "Reviewed" },
  { key: "sent", label: "Sent" },
  { key: "paid", label: "Collected" },
] as const;

const STATUS_CONFIG: Record<StatementStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  paid: { label: "Paid", icon: <Check size={12} />, cls: "bg-success/10 text-success border-success/20" },
  sent: { label: "Sent — Awaiting Payment", icon: <Send size={12} />, cls: "bg-primary/10 text-primary border-primary/20" },
  generated: { label: "Generated — Pending Send", icon: <Clock size={12} />, cls: "bg-accent/10 text-accent border-accent/20" },
  pending: { label: "Pending", icon: <Clock size={12} />, cls: "bg-muted text-muted-foreground border-border" },
  in_collections: { label: "In Collections", icon: <AlertTriangle size={12} />, cls: "bg-destructive/10 text-destructive border-destructive/20" },
};

const PAYER_SHORT: Record<string, string> = {
  private_pay: "Private",
  medicaid: "Medicaid",
  ltci: "LTCI",
  va: "VA",
  other: "Other",
};

interface Props {
  residents: ResidentBilling[];
  cycleStats: typeof INITIAL_CYCLE_STATS;
  onUpdateStatementStatus: (residentId: string, status: StatementStatus) => void;
  onSendAllPending: () => void;
}

export function StatementsPanel({ residents, cycleStats, onUpdateStatementStatus, onSendAllPending }: Props) {
  const sorted = [...residents].sort((a, b) => {
    const order: Record<StatementStatus, number> = { generated: 0, pending: 1, in_collections: 2, sent: 3, paid: 4 };
    return (order[a.statementStatus] ?? 5) - (order[b.statementStatus] ?? 5);
  });

  const TOTAL = cycleStats.generated;
  const pendingCount = residents.filter((r) => r.statementStatus === "generated").length;

  return (
    <div className="flex flex-col gap-5">
      {/* Monthly cycle progress */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-4">{BILLING_MONTH} Billing Cycle</div>
        <div className="flex items-center gap-0">
          {CYCLE_STAGES.map((stage, i) => {
            const value = cycleStats[stage.key as keyof typeof cycleStats];
            const complete = value === TOTAL;
            const isLast = i === CYCLE_STAGES.length - 1;
            return (
              <div key={stage.key} className="flex items-center flex-1">
                <div className="flex-1">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg",
                    complete ? "bg-success/10" : "bg-secondary/50",
                  )}>
                    <div className={cn(
                      "size-5 rounded-full grid place-items-center shrink-0",
                      complete ? "bg-success text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}>
                      {complete ? <Check size={11} /> : <span className="text-[9px] font-mono">{i + 1}</span>}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{stage.label}</div>
                      <div className={cn("font-mono text-[11px]", complete ? "text-success" : "text-muted-foreground")}>
                        {value}/{TOTAL}
                      </div>
                    </div>
                  </div>
                </div>
                {!isLast && <ChevronRight size={14} className="text-muted-foreground mx-1 shrink-0" />}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
          <Stat label="Invoices generated" value={`${cycleStats.generated}`} />
          <Stat label="Statements sent" value={`${cycleStats.sent}`} />
          <Stat
            label="Payments collected"
            value={`${cycleStats.paid}`}
            sub={`${TOTAL - cycleStats.paid} outstanding`}
            warn={TOTAL - cycleStats.paid > 3}
          />
          <Stat label="Collection rate" value={`${Math.round((cycleStats.paid / TOTAL) * 100)}%`} />
          <div className="ml-auto">
            {pendingCount > 0 ? (
              <button
                onClick={onSendAllPending}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-colors font-medium"
              >
                <Send size={11} />
                Send {pendingCount} Pending Statement{pendingCount !== 1 ? "s" : ""}
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border text-muted-foreground">
                <Check size={11} />
                All statements sent
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Per-resident statement status */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-[2fr_90px_1fr_1fr_180px_130px] gap-3 px-4 py-2.5 bg-secondary/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Resident</span>
          <span>Room</span>
          <span>Payer</span>
          <span className="text-right">Invoice Amount</span>
          <span>Status</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-border/50">
          {sorted.map((r) => {
            const ancillaryTotal = r.ancillaryCharges.reduce((sum, c) => sum + c.amount, 0);
            const invoiceAmt = r.prorationNote ? r.currentBalance : r.monthlyTotal + ancillaryTotal;
            const cfg = STATUS_CONFIG[r.statementStatus];

            return (
              <div
                key={r.id}
                className="grid grid-cols-[2fr_90px_1fr_1fr_180px_130px] gap-3 px-4 py-3 items-center hover:bg-secondary/20 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  {r.prorationNote && (
                    <div className="text-[10px] text-accent mt-0.5">Prorated — move-in {r.moveInDate}</div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{r.room}</div>
                <div className="flex flex-wrap gap-1">
                  {r.payers.map((p, i) => (
                    <span key={i} className="text-[10px] text-muted-foreground">
                      {PAYER_SHORT[p.type] ?? p.type}{i < r.payers.length - 1 ? " +" : ""}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-sm text-right">{usdFull(invoiceAmt)}</div>
                <div>
                  <span className={cn("inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border font-medium", cfg.cls)}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>
                <div>
                  {r.statementStatus === "generated" && (
                    <button
                      onClick={() => onUpdateStatementStatus(r.id, "sent")}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-primary/25 bg-primary/5 text-primary hover:bg-primary/15 transition-colors font-medium cursor-pointer"
                    >
                      <Send size={10} /> Send
                    </button>
                  )}
                  {r.statementStatus === "sent" && (
                    <button
                      onClick={() => onUpdateStatementStatus(r.id, "paid")}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-success/25 bg-success/5 text-success hover:bg-success/15 transition-colors font-medium cursor-pointer"
                    >
                      <Check size={10} /> Mark Paid
                    </button>
                  )}
                  {r.statementStatus === "pending" && (
                    <button
                      onClick={() => onUpdateStatementStatus(r.id, "generated")}
                      className="text-[11px] px-2.5 py-1 rounded border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Generate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-lg font-semibold", warn ? "text-accent" : "text-foreground")}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function usdFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
