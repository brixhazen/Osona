import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserCheck, X, Check } from "lucide-react";
import type { Lead, CareInterest, BudgetType } from "@/lib/mock/crm";
import type { ResidentBilling, PayerType, PaymentMethod, AncillaryCharge } from "@/lib/mock/billing";

interface Props {
  lead: Lead;
  onConfirm: (resident: ResidentBilling) => void;
  onSkip: () => void;
}

const WINGS = ["East Wing", "West Wing", "Memory Care", "Independent Living"] as const;
const LOC_TIERS = ["Basic", "Moderate", "Enhanced", "Enhanced+", "Memory Care"] as const;
const PAYER_TYPES: { value: PayerType; label: string }[] = [
  { value: "private_pay", label: "Private Pay" },
  { value: "ltci", label: "LTCI" },
  { value: "medicaid", label: "Medicaid" },
  { value: "va", label: "VA" },
];
const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "ach", label: "ACH" },
  { value: "check", label: "Check" },
  { value: "credit_card", label: "Credit Card" },
  { value: "eft", label: "EFT" },
];

const CARE_TO_LOC: Record<CareInterest, { locTier: string; baseRate: number; locRate: number }> = {
  independent: { locTier: "Basic", baseRate: 3200, locRate: 0 },
  assisted:    { locTier: "Moderate", baseRate: 4800, locRate: 600 },
  memory_care: { locTier: "Memory Care", baseRate: 5800, locRate: 1100 },
  respite:     { locTier: "Enhanced", baseRate: 5400, locRate: 850 },
  undecided:   { locTier: "Moderate", baseRate: 4800, locRate: 450 },
};

const CARE_TO_WING: Record<CareInterest, string> = {
  independent: "Independent Living",
  assisted:    "East Wing",
  memory_care: "Memory Care",
  respite:     "East Wing",
  undecided:   "East Wing",
};

const BUDGET_TO_PAYER: Record<BudgetType, PayerType> = {
  private_pay: "private_pay",
  ltci: "ltci",
  medicaid: "medicaid",
  va: "va",
  unknown: "private_pay",
};

const PAYER_LABELS: Record<PayerType, string> = {
  private_pay: "Private Pay",
  medicaid: "Medicaid",
  ltci: "LTCI",
  va: "VA Benefits",
  other: "Other",
};

export function NewResidentSetupModal({ lead, onConfirm, onSkip }: Props) {
  const locDefaults = CARE_TO_LOC[lead.careInterest];

  // Section 1 — Resident details
  const [room, setRoom] = useState("");
  const [wing, setWing] = useState(CARE_TO_WING[lead.careInterest]);
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().slice(0, 10));

  // Section 2 — Level of care & rate
  const [locTier, setLocTier] = useState(locDefaults.locTier);
  const [baseRate, setBaseRate] = useState(locDefaults.baseRate.toString());
  const [locRate, setLocRate] = useState(locDefaults.locRate.toString());

  // Section 3 — Payer
  const [payerType, setPayerType] = useState<PayerType>(BUDGET_TO_PAYER[lead.budget]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("check");
  const [autopay, setAutopay] = useState(false);
  const [policyNumber, setPolicyNumber] = useState("");

  // Section 4 — Responsible party (pre-filled from lead)
  const [rpName, setRpName] = useState(lead.primaryContact.name);
  const [rpRelation, setRpRelation] = useState(lead.primaryContact.relation);
  const [rpPhone, setRpPhone] = useState(lead.primaryContact.phone);
  const [rpEmail, setRpEmail] = useState(lead.primaryContact.email ?? "");

  // Section 5 — First invoice
  const [communityFeeOn, setCommunityFeeOn] = useState(true);
  const [communityFeeAmt, setCommunityFeeAmt] = useState("3500");
  const [proRate, setProRate] = useState(new Date(moveInDate).getDate() !== 1);

  const monthlyTotal = (parseFloat(baseRate) || 0) + (parseFloat(locRate) || 0);
  const feeAmt = communityFeeOn ? (parseFloat(communityFeeAmt) || 0) : 0;

  const { invoiceAmt, prorationNote } = calcFirstInvoice(moveInDate, monthlyTotal, feeAmt, proRate);

  const canConfirm = room.trim().length > 0;

  function handleConfirm() {
    if (!canConfirm) return;

    const ancillaryCharges: AncillaryCharge[] = communityFeeOn
      ? [{
          id: `ac-fee-${Date.now()}`,
          item: "Community Fee (one-time)",
          category: "Move-In",
          amount: feeAmt,
          date: moveInDate,
          postedBy: "Current User",
          recurring: false,
        }]
      : [];

    const resident: ResidentBilling = {
      id: `r-crm-${Date.now()}`,
      name: `${lead.firstName} ${lead.lastName}`,
      room: room.trim(),
      wing,
      locTier,
      moveInDate,
      baseRate: parseFloat(baseRate) || 0,
      locRate: parseFloat(locRate) || 0,
      monthlyTotal,
      payers: [{
        type: payerType,
        label: PAYER_LABELS[payerType],
        coveragePct: 100,
        policyNumber: policyNumber || undefined,
        paymentMethod,
      }],
      responsibleParty: {
        name: rpName,
        relationship: rpRelation,
        phone: rpPhone,
        email: rpEmail,
        autopay,
      },
      currentBalance: invoiceAmt,
      arBucket: "current",
      collectionStatus: "none",
      lastPaymentDate: "—",
      lastPaymentAmount: 0,
      statementStatus: "generated",
      ancillaryCharges,
      paymentHistory: [],
      rateHistory: [{
        effectiveDate: moveInDate,
        baseRate: parseFloat(baseRate) || 0,
        locTier,
        locRate: parseFloat(locRate) || 0,
        total: monthlyTotal,
        reason: "Move-in rate",
      }],
      prorationNote: proRate && prorationNote ? prorationNote : undefined,
      notes: `Added from CRM pipeline. Contact: ${rpName} (${rpRelation}) ${rpPhone}`,
    };

    onConfirm(resident);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
          <div className="size-10 rounded-full bg-success/15 flex items-center justify-center shrink-0">
            <UserCheck size={18} className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-base">Set Up New Resident</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {lead.firstName} {lead.lastName} confirmed move-in — configure their billing account
            </p>
          </div>
          <button
            onClick={onSkip}
            title="Skip for now"
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Section 1: Resident Info ── */}
          <section>
            <SectionLabel>Resident Info</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="field-label">Full Name</label>
                <div className="rounded border border-border bg-secondary/30 px-2.5 py-1.5 text-sm text-muted-foreground">
                  {lead.firstName} {lead.lastName}{lead.age ? ` · ${lead.age} yo` : ""}
                </div>
              </div>
              <div>
                <label className="field-label">Move-In Date</label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => { setMoveInDate(e.target.value); setProRate(new Date(e.target.value).getDate() !== 1); }}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="field-label">Room # <span className="text-destructive">*</span></label>
                <input
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. E-214, MC-108"
                  className={cn(
                    "w-full rounded border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary",
                    !room.trim() ? "border-accent/40" : "border-border",
                  )}
                />
              </div>
              <div className="col-span-2">
                <label className="field-label">Wing</label>
                <div className="flex gap-2 flex-wrap">
                  {WINGS.map((w) => (
                    <button
                      key={w}
                      onClick={() => setWing(w)}
                      className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer",
                        wing === w ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Level of Care & Rate ── */}
          <section>
            <SectionLabel>Level of Care & Monthly Rate</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="field-label">LOC Tier</label>
                <div className="flex gap-2 flex-wrap">
                  {LOC_TIERS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setLocTier(t)}
                      className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer",
                        locTier === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="field-label">Base Rate ($)</label>
                  <input
                    type="number"
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="field-label">LOC Add-On ($)</label>
                  <input
                    type="number"
                    value={locRate}
                    onChange={(e) => setLocRate(e.target.value)}
                    className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="rounded-lg border border-success/25 bg-success/5 px-3 py-2 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Monthly Total</div>
                  <div className="font-mono font-semibold text-success text-lg">{usdFull(monthlyTotal)}</div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 3: Payer Setup ── */}
          <section>
            <SectionLabel>Payer Setup</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="field-label">Primary Payer</label>
                <div className="flex gap-2 flex-wrap">
                  {PAYER_TYPES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPayerType(p.value)}
                      className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer",
                        payerType === p.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Payment Method</label>
                <div className="flex gap-2 flex-wrap">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      className={cn(
                        "px-3 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer",
                        paymentMethod === m.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              {(payerType === "ltci" || payerType === "medicaid" || payerType === "va") && (
                <div>
                  <label className="field-label">
                    {payerType === "ltci" ? "Policy #" : payerType === "va" ? "VA Claim #" : "Case #"}
                  </label>
                  <input
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="Optional — add later"
                    className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  onClick={() => setAutopay(!autopay)}
                  className={cn(
                    "w-8 h-4.5 rounded-full transition-colors relative cursor-pointer border",
                    autopay ? "bg-success border-success/50" : "bg-muted border-border",
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
                    autopay ? "translate-x-4" : "translate-x-0.5",
                  )} />
                </div>
                <span className="text-xs font-medium">Enroll in Autopay</span>
              </label>
            </div>
          </section>

          {/* ── Section 4: Responsible Party ── */}
          <section>
            <SectionLabel>Responsible Party</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Name</label>
                <input
                  value={rpName}
                  onChange={(e) => setRpName(e.target.value)}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="field-label">Relationship</label>
                <input
                  value={rpRelation}
                  onChange={(e) => setRpRelation(e.target.value)}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="field-label">Phone</label>
                <input
                  value={rpPhone}
                  onChange={(e) => setRpPhone(e.target.value)}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input
                  value={rpEmail}
                  onChange={(e) => setRpEmail(e.target.value)}
                  type="email"
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          {/* ── Section 5: First Invoice ── */}
          <section>
            <SectionLabel>First Invoice</SectionLabel>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={communityFeeOn}
                      onChange={(e) => setCommunityFeeOn(e.target.checked)}
                      className="rounded border-border cursor-pointer"
                    />
                    <span className="text-sm font-medium">Community Fee (one-time)</span>
                  </label>
                  <p className="text-[11px] text-muted-foreground ml-5 mt-0.5">Charged on first invoice at move-in</p>
                </div>
                {communityFeeOn && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={communityFeeAmt}
                      onChange={(e) => setCommunityFeeAmt(e.target.value)}
                      className="w-24 rounded border border-border bg-background px-2.5 py-1 text-sm text-right font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={proRate}
                    onChange={(e) => setProRate(e.target.checked)}
                    className="rounded border-border cursor-pointer"
                  />
                  <span className="text-sm font-medium">Pro-rate first month</span>
                </label>
                <p className="text-[11px] text-muted-foreground ml-5 mt-0.5">
                  Calculates partial month from move-in date
                </p>
              </div>

              {/* Invoice preview */}
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">First Invoice Preview</div>
                <div className="space-y-1">
                  {proRate && prorationNote && (
                    <div className="text-[11px] text-muted-foreground">{prorationNote}</div>
                  )}
                  {!proRate && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Monthly charges</span>
                      <span className="font-mono">{usdFull(monthlyTotal)}</span>
                    </div>
                  )}
                  {communityFeeOn && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Community fee</span>
                      <span className="font-mono">{usdFull(feeAmt)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-border pt-1.5 mt-1">
                    <span className="text-xs font-semibold">Total due at move-in</span>
                    <span className="font-mono font-semibold text-sm text-success">{usdFull(invoiceAmt)}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-primary">
                  <Check size={11} />
                  Invoice will be generated automatically (status: Generated)
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-border shrink-0">
          {!room.trim() && (
            <p className="text-[11px] text-accent flex-1">Room number is required to continue</p>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onSkip}
              className="px-4 py-2 rounded text-sm border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Skip for Now
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium bg-success text-white hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
            >
              <UserCheck size={14} />
              Confirm & Create Resident
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">{children}</p>
  );
}

function calcFirstInvoice(
  moveInDate: string,
  monthlyTotal: number,
  feeAmt: number,
  proRate: boolean,
): { invoiceAmt: number; prorationNote: string } {
  if (!proRate || !moveInDate) {
    return { invoiceAmt: monthlyTotal + feeAmt, prorationNote: "" };
  }
  const parts = moveInDate.split("-").map(Number);
  const [year, month, day] = parts;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysRemaining = daysInMonth - day + 1;
  const proratedAmt = Math.round((monthlyTotal / daysInMonth) * daysRemaining * 100) / 100;
  const total = Math.round((proratedAmt + feeAmt) * 100) / 100;
  const note =
    `${daysRemaining} of ${daysInMonth} days × (${usdFull(monthlyTotal)} ÷ ${daysInMonth}) = ${usdFull(proratedAmt)}` +
    (feeAmt > 0 ? ` + ${usdFull(feeAmt)} community fee = ${usdFull(total)}` : "");
  return { invoiceAmt: total, prorationNote: note };
}

function usdFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
