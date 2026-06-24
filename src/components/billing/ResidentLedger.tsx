import { useState } from "react";
import {
  CHARGE_CATALOG,
  type ResidentBilling, type PayerType, type PaymentMethod,
  type Payment, type AncillaryCharge, type RateRecord,
  type TrustTransaction, type StatementStatus,
} from "@/lib/mock/billing";
import { cn } from "@/lib/utils";
import {
  ChevronRight, CreditCard, Check, TrendingUp, Wallet,
  Plus, Send, DollarSign, ChevronUp, Search, X, ArrowLeft,
} from "lucide-react";

type Filter = "all" | PayerType | "overdue";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "private_pay", label: "Private Pay" },
  { id: "medicaid", label: "Medicaid" },
  { id: "ltci", label: "LTCI" },
  { id: "va", label: "VA" },
  { id: "overdue", label: "Overdue" },
];

const STATEMENT_CONFIG: Record<ResidentBilling["statementStatus"], { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-success/10 text-success" },
  sent: { label: "Sent", cls: "bg-primary/10 text-primary" },
  generated: { label: "Draft", cls: "bg-accent/10 text-accent" },
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground" },
  in_collections: { label: "Collections", cls: "bg-destructive/10 text-destructive" },
};

const PAYER_LABELS: Record<PayerType, string> = {
  private_pay: "Private Pay",
  medicaid: "Medicaid",
  ltci: "LTCI",
  va: "VA",
  other: "Other",
};

const PAYER_COLORS: Record<PayerType, string> = {
  private_pay: "bg-primary/10 text-primary",
  medicaid: "bg-accent/10 text-accent",
  ltci: "bg-success/10 text-success",
  va: "bg-blue-400/10 text-blue-400",
  other: "bg-muted text-muted-foreground",
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  ach: "ACH",
  check: "Check",
  credit_card: "Credit Card",
  eft: "EFT",
};

const LOC_TIERS = ["Basic", "Moderate", "Enhanced", "Enhanced+", "Memory Care"];

// Pending incidental approvals (demo data, keyed by resident name)
const PENDING_BY_NAME: Record<string, number> = {
  "Ruth Novak": 1,
  "Howard Ingram": 1,
  "Beverly Stone": 1,
  "Vivian Marsh": 1,
  "Thomas Reed": 1,
  "Eleanor Price": 1,
  "George Holt": 1,
  "Sandra Kim": 1,
};

// Days overdue for residents with red balances (demo data, keyed by name)
const OVERDUE_DAYS_BY_NAME: Record<string, number> = {
  "Vivian Marsh": 45,
  "Howard Ingram": 72,
  "Ruth Novak": 94,
  "Beverly Stone": 18,
};

// Charge library for the quick Add Charge modal
const QUICK_CHARGE_LIBRARY = [
  { id: "salon", label: "Salon / Hair", defaultAmount: 35 },
  { id: "guest-meal", label: "Guest Meal", defaultAmount: 12 },
  { id: "transport", label: "Transportation", defaultAmount: 45 },
  { id: "incontinence", label: "Incontinence Supplies", defaultAmount: 28 },
  { id: "podiatry", label: "Podiatry Visit", defaultAmount: 65 },
  { id: "pharmacy", label: "Pharmacy Copay", defaultAmount: 18 },
];

const CURRENT_USER = "Lisa W.";

const GRID_COLS =
  "grid-cols-[2fr_100px_1fr_110px_140px_160px_140px_90px_40px]";

interface Props {
  residents: ResidentBilling[];
  onRecordPayment: (residentId: string, payment: Payment) => void;
  onAddAncillaryCharge: (residentId: string, charge: AncillaryCharge) => void;
  onAddRateChange: (residentId: string, rate: RateRecord) => void;
  onAddTrustTransaction: (residentId: string, tx: TrustTransaction) => void;
  onUpdateStatementStatus: (residentId: string, status: StatementStatus) => void;
}

export function ResidentLedger({
  residents,
  onRecordPayment,
  onAddAncillaryCharge,
  onAddRateChange,
  onAddTrustTransaction,
  onUpdateStatementStatus,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [addChargeFor, setAddChargeFor] = useState<ResidentBilling | null>(null);

  const selected = selectedId ? residents.find((r) => r.id === selectedId) ?? null : null;

  const filtered = residents.filter((r) => {
    const q = query.trim().toLowerCase();
    if (q) {
      const hay = `${r.name} ${r.room}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filter === "all") return true;
    if (filter === "overdue") return r.currentBalance > 0 && r.arBucket !== "current";
    return r.payers.some((p) => p.type === filter);
  });

  const counts: Partial<Record<Filter, number>> = { all: residents.length };
  for (const f of FILTERS.slice(1)) {
    counts[f.id] = residents.filter((r) => {
      if (f.id === "overdue") return r.currentBalance > 0 && r.arBucket !== "current";
      return r.payers.some((p) => p.type === f.id as PayerType);
    }).length;
  }

  // Full-page detail view replaces the list when a resident is selected.
  if (selected) {
    return (
      <ResidentDetailPage
        resident={selected}
        onBack={() => setSelectedId(null)}
        onRecordPayment={(p) => onRecordPayment(selected.id, p)}
        onAddAncillaryCharge={(c) => onAddAncillaryCharge(selected.id, c)}
        onAddRateChange={(rr) => onAddRateChange(selected.id, rr)}
        onAddTrustTransaction={(t) => onAddTrustTransaction(selected.id, t)}
        onUpdateStatementStatus={(s) => onUpdateStatementStatus(selected.id, s)}
      />
    );
  }

  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search residents..."
          className="w-full h-9 pl-9 pr-9 rounded-md border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-7 px-3 rounded-full text-xs font-medium border transition-colors cursor-pointer",
              filter === f.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
            {(counts[f.id] ?? 0) > 0 && (
              <span className="ml-1.5 font-mono opacity-60">{counts[f.id]}</span>
            )}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} residents</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-x-auto scrollbar-hidden">
        <div className={cn("grid gap-4 px-5 py-2.5 bg-secondary/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground", GRID_COLS)}>
          <span>Resident</span>
          <span>Room</span>
          <span>Payer(s)</span>
          <span>Pending</span>
          <span className="text-right">Monthly Rate</span>
          <span className="text-right">Balance</span>
          <span>Statement</span>
          <span>Add Charge</span>
          <span />
        </div>
        <div className="divide-y divide-border/50">
          {filtered.map((r) => (
            <ResidentRow
              key={r.id}
              resident={r}
              onClick={() => setSelectedId(r.id)}
              onAddCharge={() => setAddChargeFor(r)}
            />
          ))}
        </div>
      </div>

      {/* Quick Add Charge modal (mirrors Approvals tab) */}
      {addChargeFor && (
        <AddChargeModal
          resident={addChargeFor}
          onClose={() => setAddChargeFor(null)}
          onSubmit={(payload) => {
            onAddAncillaryCharge(addChargeFor.id, {
              id: `ac-quick-${Date.now()}`,
              item: payload.item,
              category: "other",
              amount: payload.amount,
              date: payload.date,
              postedBy: CURRENT_USER,
              recurring: false,
            });
            setAddChargeFor(null);
          }}
        />
      )}
    </>
  );
}

function ResidentRow({
  resident: r,
  onClick,
  onAddCharge,
}: {
  resident: ResidentBilling;
  onClick: () => void;
  onAddCharge: () => void;
}) {
  const isOverdue = r.currentBalance > 0 && r.arBucket !== "current";
  const sc = STATEMENT_CONFIG[r.statementStatus];
  const pendingCount = PENDING_BY_NAME[r.name] ?? 0;
  const overdueDays = OVERDUE_DAYS_BY_NAME[r.name];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={cn(
        "w-full grid gap-4 px-5 py-3 items-center hover:bg-secondary/20 transition-colors text-left cursor-pointer",
        GRID_COLS,
        isOverdue && "bg-destructive/[0.03]",
      )}
    >
      <div>
        <div className="text-sm font-medium">{r.name}</div>
        <div className="text-[11px] text-muted-foreground">{r.wing} · {r.locTier}</div>
      </div>
      <div className="text-sm text-muted-foreground">{r.room}</div>
      <div className="flex flex-wrap gap-1">
        {r.payers.map((p, i) => (
          <span key={i} className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", PAYER_COLORS[p.type])}>
            {PAYER_LABELS[p.type]}
          </span>
        ))}
        {r.responsibleParty.autopay && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">Autopay</span>
        )}
      </div>
      <div>
        {pendingCount > 0 ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-amber-400/15 text-amber-600 dark:text-amber-400">
            {pendingCount} pending
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
      <div className="text-sm font-mono text-right">{usd(r.monthlyTotal)}</div>
      <div className="text-right">
        {r.currentBalance > 0 ? (
          <>
            <div className={cn("text-sm font-mono font-medium", isOverdue ? "text-destructive" : "text-accent")}>
              {usd(r.currentBalance)}
            </div>
            {isOverdue && overdueDays != null && (
              <div className="text-[10px] text-muted-foreground mt-0.5">{overdueDays} days overdue</div>
            )}
          </>
        ) : (
          <span className="text-sm text-success font-mono">—</span>
        )}
      </div>
      <div>
        <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium", sc.cls)}>{sc.label}</span>
      </div>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Add charge for ${r.name}`}
        onClick={(e) => { e.stopPropagation(); onAddCharge(); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onAddCharge(); }
        }}
        className="inline-grid place-items-center size-6 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
      >
        <Plus size={12} />
      </span>
      <ChevronRight size={14} className="text-muted-foreground" />
    </div>
  );
}

type ActiveForm = "payment" | "charge" | "rate" | "trust" | null;

function ResidentDetailPage({
  resident: r,
  onBack,
  onRecordPayment,
  onAddAncillaryCharge,
  onAddRateChange,
  onAddTrustTransaction,
  onUpdateStatementStatus,
}: {
  resident: ResidentBilling;
  onBack: () => void;
  onRecordPayment: (p: Payment) => void;
  onAddAncillaryCharge: (c: AncillaryCharge) => void;
  onAddRateChange: (r: RateRecord) => void;
  onAddTrustTransaction: (t: TrustTransaction) => void;
  onUpdateStatementStatus: (s: StatementStatus) => void;
}) {
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);

  // Payment form state
  const [payAmt, setPayAmt] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("check");
  const [payRef, setPayRef] = useState("");
  const [payNote, setPayNote] = useState("");

  // Charge form state
  const defaultCatalogItem = CHARGE_CATALOG[0];
  const [chargeItemId, setChargeItemId] = useState(defaultCatalogItem.id);
  const [chargeAmt, setChargeAmt] = useState(defaultCatalogItem.defaultPrice.toString());
  const [chargeDate, setChargeDate] = useState(new Date().toISOString().slice(0, 10));
  const [chargeRecurring, setChargeRecurring] = useState(defaultCatalogItem.recurring);
  const [chargePostedBy, setChargePostedBy] = useState("Current User");

  // Rate form state
  const [rateBase, setRateBase] = useState(r.baseRate.toString());
  const [rateLoc, setRateLoc] = useState(r.locRate.toString());
  const [rateTier, setRateTier] = useState(r.locTier);
  const [rateReason, setRateReason] = useState("");
  const [rateDate, setRateDate] = useState(new Date().toISOString().slice(0, 10));

  // Trust form state
  const [trustType, setTrustType] = useState<"deposit" | "withdrawal">("deposit");
  const [trustAmt, setTrustAmt] = useState("");
  const [trustPurpose, setTrustPurpose] = useState("");
  const [trustStaff, setTrustStaff] = useState("Current User");

  const sc = STATEMENT_CONFIG[r.statementStatus];
  const ancillaryTotal = r.ancillaryCharges.reduce((sum, c) => sum + c.amount, 0);

  function toggleForm(form: ActiveForm) {
    setActiveForm((prev) => (prev === form ? null : form));
  }

  function savePayment() {
    const amount = parseFloat(payAmt);
    if (isNaN(amount) || amount <= 0) return;
    onRecordPayment({
      id: `p-new-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      amount,
      method: payMethod,
      reference: payRef || undefined,
      note: payNote || undefined,
    });
    setPayAmt(""); setPayRef(""); setPayNote("");
    setActiveForm(null);
  }

  function saveCharge() {
    const catalogItem = CHARGE_CATALOG.find((c) => c.id === chargeItemId)!;
    const amount = parseFloat(chargeAmt);
    if (isNaN(amount) || amount <= 0) return;
    onAddAncillaryCharge({
      id: `ac-new-${Date.now()}`,
      item: catalogItem.name,
      category: catalogItem.category,
      amount,
      date: chargeDate,
      postedBy: chargePostedBy || "Current User",
      recurring: chargeRecurring,
    });
    setActiveForm(null);
  }

  function saveRate() {
    const base = parseFloat(rateBase);
    const loc = parseFloat(rateLoc);
    if (isNaN(base) || isNaN(loc) || !rateReason.trim()) return;
    onAddRateChange({
      effectiveDate: rateDate,
      baseRate: base,
      locTier: rateTier,
      locRate: loc,
      total: base + loc,
      reason: rateReason.trim(),
    });
    setRateReason("");
    setActiveForm(null);
  }

  function saveTrust() {
    const amount = parseFloat(trustAmt);
    if (isNaN(amount) || amount <= 0 || !trustPurpose.trim()) return;
    onAddTrustTransaction({
      id: `tt-new-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type: trustType,
      amount,
      purpose: trustPurpose.trim(),
      staff: trustStaff || "Current User",
      runningBalance: 0,
    });
    setTrustAmt(""); setTrustPurpose("");
    setActiveForm(null);
  }

  return (
    <div className="resident-detail-page">
      <div className="sticky top-14 z-10 -mx-6 px-6 py-3 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center">
          <div className="flex-1 flex justify-start">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Residents
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{r.name}</span>
            <span className="text-sm text-muted-foreground">{r.room} · {r.wing}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">{r.locTier}</span>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", sc.cls)}>{sc.label}</span>
          </div>
          <div className="flex-1" />
        </div>
      </div>

      <div className="pt-5 space-y-5">
        {/* Statement status actions */}
        {r.statementStatus !== "paid" && r.statementStatus !== "in_collections" && (
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
          <span className="text-xs text-muted-foreground">Invoice status:</span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", sc.cls)}>{sc.label}</span>
          <div className="ml-auto flex gap-1.5">
            {r.statementStatus === "generated" && (
              <button
                onClick={() => onUpdateStatementStatus("sent")}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-primary/25 bg-primary/5 text-primary hover:bg-primary/15 transition-colors cursor-pointer"
              >
                <Send size={11} /> Mark Sent
              </button>
            )}
            <button
              onClick={() => onUpdateStatementStatus("paid")}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-success/25 bg-success/5 text-success hover:bg-success/15 transition-colors cursor-pointer"
            >
              <Check size={11} /> Mark Paid
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-5 lg:[grid-auto-flow:dense]">
        {/* Rate breakdown */}
        <div className="lg:col-span-4">
        <DetailSection title="Monthly Rate" icon={<TrendingUp size={13} />}>
          <div className="space-y-1.5">
            <LineItem label="Base room rate" value={usdFull(r.baseRate)} />
            {r.locRate > 0 && <LineItem label={`Level of care (${r.locTier})`} value={usdFull(r.locRate)} />}
            <div className="border-t border-border pt-1.5 mt-1">
              <LineItem label="Monthly total" value={usdFull(r.monthlyTotal)} bold />
            </div>
            {r.prorationNote && (
              <div className="mt-2 rounded-md bg-accent/5 border border-accent/20 px-3 py-2 text-[11px] text-accent">
                <div className="font-medium mb-0.5">Proration Applied</div>
                {r.prorationNote}
              </div>
            )}
          </div>
        </DetailSection>
        </div>

        {/* Payers */}
        <div className="lg:col-span-4">
        <DetailSection title="Payer Setup" icon={<Wallet size={13} />}>
          <div className="space-y-3">
            {r.payers.map((p, i) => (
              <div key={i} className="rounded-md border border-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", PAYER_COLORS[p.type])}>
                    {PAYER_LABELS[p.type]}
                  </span>
                  <span className="text-sm font-medium">{p.label}</span>
                </div>
                {p.coverageAmt && (
                  <LineItem label="Coverage" value={`${usdFull(p.coverageAmt)}/mo${p.coveragePct ? ` (${p.coveragePct}%)` : ""}`} />
                )}
                {p.policyNumber && <LineItem label="Policy #" value={p.policyNumber} />}
                {p.caseNumber && <LineItem label="Case #" value={p.caseNumber} />}
                {p.contact && <div className="text-[11px] text-muted-foreground mt-1">{p.contact}</div>}
                <LineItem label="Payment method" value={METHOD_LABELS[p.paymentMethod]} />
              </div>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Responsible party: <span className="text-foreground">{r.responsibleParty.name}</span>{" "}
            ({r.responsibleParty.relationship})
            {r.responsibleParty.autopay && (
              <span className="ml-2 text-success font-medium">✓ Autopay enrolled</span>
            )}
          </div>
        </DetailSection>
        </div>

        {/* Month-to-date charges */}
        <div className="lg:col-span-8 lg:col-start-5">
        <DetailSection title="Month-to-Date Charges (May 2026)" icon={<CreditCard size={13} />}>
          <div className="space-y-1.5">
            <LineItem label="Base monthly charges" value={usdFull(r.monthlyTotal)} />
            {r.ancillaryCharges.map((c) => (
              <LineItem
                key={c.id}
                label={`${c.item}${c.recurring ? " (recurring)" : ""}`}
                value={usdFull(c.amount)}
                sub={c.date}
              />
            ))}
            <div className="border-t border-border pt-1.5 mt-1">
              <LineItem label="Total MTD" value={usdFull(r.monthlyTotal + ancillaryTotal)} bold />
            </div>
          </div>

          {/* Post Charge form */}
          <div className="mt-3 border-t border-border/60 pt-3">
            <button
              onClick={() => toggleForm("charge")}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {activeForm === "charge" ? <ChevronUp size={12} /> : <Plus size={12} />}
              Post Ancillary Charge
            </button>
            {activeForm === "charge" && (
              <div className="mt-3 space-y-3 p-3 rounded-md bg-secondary/30 border border-border">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Item
                  </label>
                  <select
                    value={chargeItemId}
                    onChange={(e) => {
                      const item = CHARGE_CATALOG.find((c) => c.id === e.target.value)!;
                      setChargeItemId(item.id);
                      setChargeAmt(item.defaultPrice.toString());
                      setChargeRecurring(item.recurring);
                    }}
                    className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {CHARGE_CATALOG.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} — {c.category} ({c.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Amount ($)</label>
                    <input
                      type="number"
                      value={chargeAmt}
                      onChange={(e) => setChargeAmt(e.target.value)}
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Date</label>
                    <input
                      type="date"
                      value={chargeDate}
                      onChange={(e) => setChargeDate(e.target.value)}
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Posted By</label>
                  <input
                    value={chargePostedBy}
                    onChange={(e) => setChargePostedBy(e.target.value)}
                    className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chargeRecurring}
                    onChange={(e) => setChargeRecurring(e.target.checked)}
                    className="rounded border-border"
                  />
                  Recurring monthly charge
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setActiveForm(null)} className="flex-1 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
                  <button onClick={saveCharge} className="flex-1 py-1.5 rounded text-xs bg-primary text-primary-foreground font-medium cursor-pointer">Post Charge</button>
                </div>
              </div>
            )}
          </div>
        </DetailSection>
        </div>

        {/* Payment history */}
        <div className="lg:col-span-8 lg:col-start-5">
        <DetailSection title="Payment History" icon={<Check size={13} />}>
          {r.paymentHistory.length === 0 ? (
            <div className="text-sm text-muted-foreground">No payments on record.</div>
          ) : (
            <div className="space-y-1.5">
              {r.paymentHistory.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                  <div>
                    <div className="text-sm">{p.date}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {METHOD_LABELS[p.method]}{p.reference ? ` · ${p.reference}` : ""}{p.note ? ` · ${p.note}` : ""}
                    </div>
                  </div>
                  <span className="font-mono text-sm text-success">{usdFull(p.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Record Payment form */}
          <div className="mt-3 border-t border-border/60 pt-3">
            <button
              onClick={() => toggleForm("payment")}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {activeForm === "payment" ? <ChevronUp size={12} /> : <DollarSign size={12} />}
              Record Payment
            </button>
            {activeForm === "payment" && (
              <div className="mt-3 space-y-3 p-3 rounded-md bg-secondary/30 border border-border">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={payAmt}
                    onChange={(e) => setPayAmt(e.target.value)}
                    placeholder={r.currentBalance > 0 ? r.currentBalance.toString() : "0.00"}
                    className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Method</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["ach", "check", "credit_card", "eft"] as PaymentMethod[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPayMethod(m)}
                        className={cn(
                          "py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer",
                          payMethod === m ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {METHOD_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Reference #</label>
                    <input
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                      placeholder="Check #, ACH ref..."
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Note</label>
                    <input
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      placeholder="Optional..."
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveForm(null)} className="flex-1 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
                  <button
                    onClick={savePayment}
                    disabled={!payAmt || parseFloat(payAmt) <= 0}
                    className="flex-1 py-1.5 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40 cursor-pointer"
                  >
                    Save Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </DetailSection>
        </div>

        {/* Trust account */}
        {r.trustBalance !== undefined && r.trustTransactions && (
          <div className="lg:col-span-8 lg:col-start-5">
          <DetailSection title="Resident Trust Account" icon={<Wallet size={13} />}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Current balance</span>
              <span className="font-mono text-lg font-semibold">{usdFull(r.trustBalance)}</span>
            </div>
            <div className="space-y-1.5">
              {r.trustTransactions.map((t) => (
                <div key={t.id} className="flex items-center gap-2 py-1 border-b border-border/50 last:border-0">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-medium",
                    t.type === "deposit" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                  )}>
                    {t.type === "deposit" ? "+Deposit" : "Withdrawal"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">{t.purpose}</div>
                    <div className="text-[10px] text-muted-foreground">{t.date} · {t.staff}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-sm font-mono", t.type === "deposit" ? "text-success" : "text-foreground")}>
                      {t.type === "deposit" ? "+" : "−"}{usdFull(t.amount)}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">{usdFull(t.runningBalance)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust transaction form */}
            <div className="mt-3 border-t border-border/60 pt-3">
              <button
                onClick={() => toggleForm("trust")}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {activeForm === "trust" ? <ChevronUp size={12} /> : <Plus size={12} />}
                Add Transaction
              </button>
              {activeForm === "trust" && (
                <div className="mt-3 space-y-3 p-3 rounded-md bg-secondary/30 border border-border">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Type</label>
                    <div className="flex gap-2">
                      {(["deposit", "withdrawal"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTrustType(t)}
                          className={cn(
                            "flex-1 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer",
                            trustType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground",
                          )}
                        >
                          {t === "deposit" ? "Deposit" : "Withdrawal"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Amount ($)</label>
                    <input
                      type="number"
                      value={trustAmt}
                      onChange={(e) => setTrustAmt(e.target.value)}
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Purpose</label>
                    <input
                      value={trustPurpose}
                      onChange={(e) => setTrustPurpose(e.target.value)}
                      placeholder="e.g. Family deposit, personal shopping..."
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Staff</label>
                    <input
                      value={trustStaff}
                      onChange={(e) => setTrustStaff(e.target.value)}
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveForm(null)} className="flex-1 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
                    <button
                      onClick={saveTrust}
                      disabled={!trustAmt || parseFloat(trustAmt) <= 0 || !trustPurpose.trim()}
                      className="flex-1 py-1.5 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40 cursor-pointer"
                    >
                      Save Transaction
                    </button>
                  </div>
                </div>
              )}
            </div>
          </DetailSection>
          </div>
        )}

        {/* Rate history */}
        <div className="lg:col-span-4 lg:col-start-1">
        <DetailSection title="Rate History" icon={<TrendingUp size={13} />}>
          <div className="space-y-1.5">
            {r.rateHistory.map((rh, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                <div>
                  <div className="text-sm">{usdFull(rh.total)}/mo</div>
                  <div className="text-[11px] text-muted-foreground">{rh.effectiveDate} · {rh.reason}</div>
                </div>
                <span className="text-[10px] text-muted-foreground">{rh.locTier}</span>
              </div>
            ))}
          </div>

          {/* Update Rate form */}
          <div className="mt-3 border-t border-border/60 pt-3">
            <button
              onClick={() => toggleForm("rate")}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {activeForm === "rate" ? <ChevronUp size={12} /> : <Plus size={12} />}
              Update Rate
            </button>
            {activeForm === "rate" && (
              <div className="mt-3 space-y-3 p-3 rounded-md bg-secondary/30 border border-border">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Base Rate ($)</label>
                    <input
                      type="number"
                      value={rateBase}
                      onChange={(e) => setRateBase(e.target.value)}
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">LOC Add-On ($)</label>
                    <input
                      type="number"
                      value={rateLoc}
                      onChange={(e) => setRateLoc(e.target.value)}
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">LOC Tier</label>
                  <select
                    value={rateTier}
                    onChange={(e) => setRateTier(e.target.value)}
                    className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {LOC_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Effective Date</label>
                    <input
                      type="date"
                      value={rateDate}
                      onChange={(e) => setRateDate(e.target.value)}
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="text-xs text-muted-foreground pb-2">
                      New total:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {usdFull((parseFloat(rateBase) || 0) + (parseFloat(rateLoc) || 0))}/mo
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Reason *</label>
                  <input
                    value={rateReason}
                    onChange={(e) => setRateReason(e.target.value)}
                    placeholder="e.g. Annual increase, LOC reassessment..."
                    className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setActiveForm(null)} className="flex-1 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground cursor-pointer">Cancel</button>
                  <button
                    onClick={saveRate}
                    disabled={!rateReason.trim()}
                    className="flex-1 py-1.5 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40 cursor-pointer"
                  >
                    Save Rate Change
                  </button>
                </div>
              </div>
            )}
          </div>
        </DetailSection>
        </div>

        {/* Notes */}
        {r.notes && (
          <div className="lg:col-span-4 lg:col-start-1 rounded-md border border-border bg-secondary/30 px-3 py-2.5 text-[11px] text-muted-foreground">
            <div className="font-medium text-foreground mb-0.5">Notes</div>
            {r.notes}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

function DetailSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function LineItem({ label, value, sub, bold }: { label: string; value: string; sub?: string; bold?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className={cn("text-xs text-muted-foreground", bold && "text-foreground font-medium")}>{label}</span>
      <div className="text-right">
        <span className={cn("text-xs font-mono", bold && "font-semibold")}>{value}</span>
        {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function usdFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function AddChargeModal({
  resident,
  onClose,
  onSubmit,
}: {
  resident: ResidentBilling;
  onClose: () => void;
  onSubmit: (payload: { item: string; amount: number; date: string; note: string }) => void;
}) {
  const [chargeId, setChargeId] = useState(QUICK_CHARGE_LIBRARY[0].id);
  const [amount, setAmount] = useState(QUICK_CHARGE_LIBRARY[0].defaultAmount.toString());
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  function pickCharge(id: string) {
    setChargeId(id);
    const def = QUICK_CHARGE_LIBRARY.find((c) => c.id === id);
    if (def) setAmount(def.defaultAmount.toString());
  }

  function submit() {
    const amt = parseFloat(amount);
    if (!isFinite(amt) || amt <= 0) return;
    const label = QUICK_CHARGE_LIBRARY.find((c) => c.id === chargeId)?.label ?? "Incidental Charge";
    onSubmit({ item: label, amount: amt, date, note: note.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold">Add Charge</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sends to Approvals queue for review
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Resident">
            <div className="h-9 px-3 grid items-center rounded-md border border-border bg-secondary/40 text-sm">
              {resident.name} <span className="text-muted-foreground ml-1.5">· {resident.room}</span>
            </div>
          </Field>

          <Field label="Charge Type">
            <select
              value={chargeId}
              onChange={(e) => pickCharge(e.target.value)}
              className="h-9 w-full px-2 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {QUICK_CHARGE_LIBRARY.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount">
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-9 w-full px-2 rounded-md border border-border bg-card text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <Field label="Date Occurred">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 w-full px-2 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
          </div>

          <Field label="Logged By">
            <div className="h-9 px-3 grid items-center rounded-md border border-border bg-secondary/40 text-sm">
              {CURRENT_USER}
            </div>
          </Field>

          <Field label="Note (optional)">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a short note..."
              className="h-9 w-full px-2 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-3 rounded-md border border-border text-sm hover:bg-secondary/40 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="h-9 px-4 rounded-md text-sm font-medium text-white cursor-pointer"
            style={{ backgroundColor: "#83C0DF" }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
