import { useState } from "react";
import {
  DSO_DAYS,
  type ResidentBilling, type CollectionStatus, type PaymentMethod, type Payment,
} from "@/lib/mock/billing";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AlertTriangle, Phone, Mail, TrendingUp, FileText, DollarSign, Check } from "lucide-react";

interface Props {
  residents: ResidentBilling[];
  onAdvanceCollectionStatus: (residentId: string, status: CollectionStatus) => void;
  onRecordPayment: (residentId: string, payment: Payment) => void;
}

type ActionType = "call" | "email" | "payment";

const COLLECTION_LABELS: Record<CollectionStatus, string> = {
  none: "—",
  first_notice: "1st Notice Sent",
  second_notice: "2nd Notice Sent",
  escalated: "Escalated",
  collections: "Collections",
};

const COLLECTION_COLORS: Record<CollectionStatus, string> = {
  none: "text-muted-foreground",
  first_notice: "text-accent",
  second_notice: "text-accent font-medium",
  escalated: "text-destructive font-medium",
  collections: "text-destructive font-semibold",
};

const NOTICE_NEXT: Record<CollectionStatus, CollectionStatus | null> = {
  none: "first_notice",
  first_notice: "second_notice",
  second_notice: "escalated",
  escalated: "collections",
  collections: null,
};

const NOTICE_BTN_LABEL: Record<CollectionStatus, string> = {
  none: "Send 1st Notice",
  first_notice: "Send 2nd Notice",
  second_notice: "Escalate",
  escalated: "Send to Collections",
  collections: "In Collections",
};

export function ArDashboard({ residents, onAdvanceCollectionStatus, onRecordPayment }: Props) {
  const [actionPanel, setActionPanel] = useState<{ resident: ResidentBilling; type: ActionType } | null>(null);

  const withBalance = residents.filter((r) => r.currentBalance > 0);
  const sorted = [...withBalance].sort((a, b) => {
    const bucketOrder: Record<string, number> = { "90_plus": 0, "60_90": 1, "30_60": 2, current: 3 };
    return (bucketOrder[a.arBucket] ?? 4) - (bucketOrder[b.arBucket] ?? 4);
  });

  const arCurrent = residents.filter((r) => r.arBucket === "current" && r.currentBalance > 0).reduce((s, r) => s + r.currentBalance, 0);
  const ar30_60 = residents.filter((r) => r.arBucket === "30_60").reduce((s, r) => s + r.currentBalance, 0);
  const ar60_90 = residents.filter((r) => r.arBucket === "60_90").reduce((s, r) => s + r.currentBalance, 0);
  const ar90Plus = residents.filter((r) => r.arBucket === "90_plus").reduce((s, r) => s + r.currentBalance, 0);
  const arTotal = arCurrent + ar30_60 + ar60_90 + ar90Plus;

  const AR_BUCKETS = [
    { label: "Current (0–30 days)", amount: arCurrent, key: "current", tone: "ok" as const },
    { label: "31–60 Days", amount: ar30_60, key: "30_60", tone: "warn" as const },
    { label: "61–90 Days", amount: ar60_90, key: "60_90", tone: "danger" as const },
    { label: "90+ Days", amount: ar90Plus, key: "90_plus", tone: "danger" as const },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* DSO + bucket cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="rounded-lg border border-border bg-card p-4 flex flex-col justify-between">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Days Sales Outstanding</div>
          <div>
            <div className="font-mono text-3xl font-semibold text-success">{DSO_DAYS}</div>
            <div className="text-[11px] text-muted-foreground mt-1">days · target &lt; 30</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-success">
            <TrendingUp size={10} /> Healthy
          </div>
        </div>
        {AR_BUCKETS.map((b) => (
          <BucketCard key={b.key} bucket={b} total={arTotal || 1} />
        ))}
      </div>

      {/* Aging table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Outstanding Accounts</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {sorted.length} residents with balances · {residents.length} total residents
            </div>
          </div>
          {arTotal > 0 ? (
            <span className="font-mono text-sm font-semibold text-destructive">{usd(arTotal)} total</span>
          ) : (
            <span className="text-sm text-success font-medium">All balances cleared</span>
          )}
        </div>

        <div className="grid grid-cols-[2fr_80px_100px_120px_120px_160px_1fr] gap-2 px-4 py-2.5 bg-secondary/20 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Resident</span>
          <span>Room</span>
          <span>Bucket</span>
          <span className="text-right">Balance</span>
          <span>Last Payment</span>
          <span>Collection Status</span>
          <span>Actions</span>
        </div>

        <div className="divide-y divide-border/50">
          {sorted.map((r) => (
            <ArRow
              key={r.id}
              resident={r}
              onOpenAction={(type) => setActionPanel({ resident: r, type })}
              onAdvanceCollectionStatus={onAdvanceCollectionStatus}
            />
          ))}
          {sorted.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No outstanding balances.
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border bg-secondary/20 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Remaining {residents.length - sorted.length} residents — no outstanding balances
          </span>
          <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
            <span>0–30 days: {usd(arCurrent)}</span>
            <span>31–60 days: {usd(ar30_60)}</span>
            <span>61–90 days: {usd(ar60_90)}</span>
            <span className="text-destructive">90+ days: {usd(ar90Plus)}</span>
          </div>
        </div>
      </div>

      {/* Action sheet */}
      <Sheet open={actionPanel !== null} onOpenChange={(o) => !o && setActionPanel(null)}>
        <SheetContent className="w-[420px] sm:max-w-md bg-card border-l border-border overflow-y-auto">
          {actionPanel && (
            <ActionSheetContent
              resident={actionPanel.resident}
              type={actionPanel.type}
              onSavePayment={(payment) => {
                onRecordPayment(actionPanel.resident.id, payment);
                setActionPanel(null);
              }}
              onClose={() => setActionPanel(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ArRow({
  resident: r,
  onOpenAction,
  onAdvanceCollectionStatus,
}: {
  resident: ResidentBilling;
  onOpenAction: (type: ActionType) => void;
  onAdvanceCollectionStatus: (id: string, status: CollectionStatus) => void;
}) {
  const [noticeConfirm, setNoticeConfirm] = useState(false);

  const bucketColors: Record<string, string> = {
    current: "bg-accent/10 text-accent",
    "30_60": "bg-accent/10 text-accent",
    "60_90": "bg-destructive/10 text-destructive",
    "90_plus": "bg-destructive/15 text-destructive font-semibold",
  };
  const bucketLabels: Record<string, string> = {
    current: "0–30 days",
    "30_60": "31–60 days",
    "60_90": "61–90 days",
    "90_plus": "90+ days",
  };

  const nextStatus = NOTICE_NEXT[r.collectionStatus];
  const canSendNotice = nextStatus !== null;

  return (
    <div className={cn(
      r.arBucket === "90_plus" ? "bg-destructive/5" : r.arBucket === "60_90" ? "bg-destructive/[0.03]" : "",
    )}>
      <div className="grid grid-cols-[2fr_80px_100px_120px_120px_160px_1fr] gap-2 px-4 py-3 items-center">
        <div>
          <div className="flex items-center gap-2">
            {(r.arBucket === "90_plus" || r.arBucket === "60_90") && (
              <AlertTriangle size={12} className="text-destructive shrink-0" />
            )}
            <span className="text-sm font-medium">{r.name}</span>
          </div>
          {r.notes && (
            <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[220px]">
              {r.notes.slice(0, 70)}…
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">{r.room}</div>
        <div>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", bucketColors[r.arBucket])}>
            {bucketLabels[r.arBucket]}
          </span>
        </div>
        <div className={cn(
          "text-right font-mono font-semibold",
          r.arBucket === "90_plus" || r.arBucket === "60_90" ? "text-destructive" : r.arBucket === "30_60" ? "text-accent" : "",
        )}>
          {usd(r.currentBalance)}
        </div>
        <div className="text-xs text-muted-foreground">{r.lastPaymentDate}</div>
        <div className={cn("text-xs", COLLECTION_COLORS[r.collectionStatus])}>
          {COLLECTION_LABELS[r.collectionStatus]}
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <ActionBtn icon={<Phone size={11} />} label="Call" onClick={() => onOpenAction("call")} />
          <ActionBtn icon={<Mail size={11} />} label="Email" onClick={() => onOpenAction("email")} />
          <ActionBtn icon={<DollarSign size={11} />} label="Pay" onClick={() => onOpenAction("payment")} />
          {canSendNotice && !noticeConfirm && (
            <ActionBtn
              icon={<FileText size={11} />}
              label={NOTICE_BTN_LABEL[r.collectionStatus]}
              onClick={() => setNoticeConfirm(true)}
              danger={r.collectionStatus === "escalated" || r.collectionStatus === "second_notice"}
            />
          )}
          {r.arBucket === "90_plus" && r.collectionStatus === "collections" && (
            <span className="text-[10px] text-destructive font-medium px-1.5">Collections</span>
          )}
        </div>
      </div>

      {/* Inline notice confirmation */}
      {noticeConfirm && nextStatus && (
        <div className="mx-4 mb-3 px-3 py-2.5 rounded-md border border-accent/30 bg-accent/5 flex items-center gap-3">
          <div className="flex-1 text-xs">
            Advance <span className="font-medium">{r.name}</span> to{" "}
            <span className="font-medium text-accent">{COLLECTION_LABELS[nextStatus]}</span>?
          </div>
          <button
            onClick={() => setNoticeConfirm(false)}
            className="text-[11px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => { onAdvanceCollectionStatus(r.id, nextStatus); setNoticeConfirm(false); }}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded border border-accent/25 bg-accent/10 text-accent font-medium hover:bg-accent/20 cursor-pointer"
          >
            <Check size={10} /> Confirm
          </button>
        </div>
      )}
    </div>
  );
}

function ActionSheetContent({
  resident: r, type, onSavePayment, onClose,
}: {
  resident: ResidentBilling;
  type: ActionType;
  onSavePayment: (payment: Payment) => void;
  onClose: () => void;
}) {
  const [callOutcome, setCallOutcome] = useState<"reached" | "voicemail" | "no_answer">("reached");
  const [logNotes, setLogNotes] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [payAmt, setPayAmt] = useState(r.currentBalance.toString());
  const [payMethod, setPayMethod] = useState<PaymentMethod>("check");
  const [payRef, setPayRef] = useState("");
  const [payNote, setPayNote] = useState("");

  const titles: Record<ActionType, string> = {
    call: "Log Phone Call",
    email: "Log Email",
    payment: "Record Payment",
  };

  return (
    <>
      <SheetHeader className="mb-6">
        <SheetTitle>{titles[type]}</SheetTitle>
        <SheetDescription>
          {r.name} · {r.room} · Balance: {usdFull(r.currentBalance)}
        </SheetDescription>
      </SheetHeader>

      {type === "call" && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Outcome
            </label>
            <div className="flex gap-2">
              {(["reached", "voicemail", "no_answer"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setCallOutcome(o)}
                  className={cn(
                    "flex-1 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer",
                    callOutcome === o
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o === "reached" ? "Reached" : o === "voicemail" ? "Voicemail" : "No Answer"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Notes
            </label>
            <textarea
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="Call summary, outcome, next steps..."
              rows={4}
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <button onClick={onClose} className="flex-1 py-2 rounded text-sm border border-border text-muted-foreground hover:text-foreground cursor-pointer">
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded text-sm bg-primary text-primary-foreground font-medium cursor-pointer"
            >
              Log Call
            </button>
          </div>
        </div>
      )}

      {type === "email" && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Subject
            </label>
            <input
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="e.g. May 2026 Invoice — Balance Due"
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Notes
            </label>
            <textarea
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="What was communicated..."
              rows={4}
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <button onClick={onClose} className="flex-1 py-2 rounded text-sm border border-border text-muted-foreground hover:text-foreground cursor-pointer">
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded text-sm bg-primary text-primary-foreground font-medium cursor-pointer"
            >
              Log Email
            </button>
          </div>
        </div>
      )}

      {type === "payment" && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="number"
                value={payAmt}
                onChange={(e) => setPayAmt(e.target.value)}
                className="w-full rounded border border-border bg-background pl-6 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["ach", "check", "credit_card", "eft"] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setPayMethod(m)}
                  className={cn(
                    "py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer",
                    payMethod === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "ach" ? "ACH" : m === "check" ? "Check" : m === "credit_card" ? "Credit Card" : "EFT"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Reference #
            </label>
            <input
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              placeholder="Check #, ACH ref, etc."
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Note
            </label>
            <input
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              placeholder="Optional note..."
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <button onClick={onClose} className="flex-1 py-2 rounded text-sm border border-border text-muted-foreground hover:text-foreground cursor-pointer">
              Cancel
            </button>
            <button
              disabled={!payAmt || parseFloat(payAmt) <= 0}
              onClick={() => {
                onSavePayment({
                  id: `p-ar-${Date.now()}`,
                  date: new Date().toISOString().slice(0, 10),
                  amount: parseFloat(payAmt),
                  method: payMethod,
                  reference: payRef || undefined,
                  note: payNote || undefined,
                });
              }}
              className="flex-1 py-2 rounded text-sm bg-primary text-primary-foreground font-medium disabled:opacity-40 cursor-pointer"
            >
              Record Payment
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function BucketCard({
  bucket, total,
}: {
  bucket: { label: string; amount: number; key: string; tone: "ok" | "warn" | "danger" };
  total: number;
}) {
  const pct = Math.round((bucket.amount / total) * 100);
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4",
      bucket.tone === "danger" ? "border-destructive/30" : bucket.tone === "warn" ? "border-accent/30" : "border-border",
    )}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{bucket.label}</div>
      <div className={cn(
        "font-mono text-xl font-semibold",
        bucket.tone === "danger" ? "text-destructive" : bucket.tone === "warn" ? "text-accent" : "text-success",
      )}>
        {usd(bucket.amount)}
      </div>
      <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            bucket.tone === "danger" ? "bg-destructive" : bucket.tone === "warn" ? "bg-accent" : "bg-success",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">{pct}% of total A/R</div>
    </div>
  );
}

function ActionBtn({
  icon, label, onClick, danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors cursor-pointer",
        danger
          ? "border-destructive/30 text-destructive hover:bg-destructive/10"
          : "border-border hover:bg-secondary text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function usdFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
