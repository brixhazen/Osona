import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Info } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  type RateCard,
  type LocTier,
  type SecondaryCharge,
  LOC_TIER_LABEL,
  LOC_TIER_ORDER,
  computeRateCardTotal,
} from "@/lib/billingTypes";
import {
  createRateCard,
  getCommunityLocDefaults,
  getCurrentRateCard,
} from "@/lib/rateCardStore";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  residentId: string;
  residentName: string;
  onSaved?: (card: RateCard) => void;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysInMonthFromIso(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

function fmtMonth(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}

export function RateCardEditorSheet({ open, onOpenChange, residentId, residentName, onSaved }: Props) {
  const current = useMemo(() => getCurrentRateCard(residentId), [residentId, open]);
  const defaults = getCommunityLocDefaults();

  const [effectiveDate, setEffectiveDate] = useState(todayIso());
  const [baseRate, setBaseRate] = useState("0");
  const [tier, setTier] = useState<LocTier>("none");
  const [overrideLoc, setOverrideLoc] = useState(false);
  const [customLocRate, setCustomLocRate] = useState("0");
  const [secondary, setSecondary] = useState<SecondaryCharge[]>([]);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset to current rate card whenever opened
  useEffect(() => {
    if (!open) return;
    setEffectiveDate(todayIso());
    setBaseRate(String(current?.baseRate ?? 0));
    setTier(current?.locTier ?? "none");
    const isOverride = !!current?.locRateOverridden;
    setOverrideLoc(isOverride);
    setCustomLocRate(String(current?.locRate ?? 0));
    setSecondary((current?.secondaryCharges ?? []).map((s) => ({ ...s })));
    setReason("");
    setError(null);
  }, [open, current]);

  const baseRateNum = Number(baseRate) || 0;
  const resolvedLocRate = overrideLoc ? Number(customLocRate) || 0 : defaults[tier];
  const newTotal = computeRateCardTotal(baseRateNum, resolvedLocRate, secondary);

  // Mid-month proration preview
  const day = Number(effectiveDate.slice(8, 10));
  const daysInMonth = daysInMonthFromIso(effectiveDate);
  const showProration = day > 1 && current != null && effectiveDate >= todayIso().slice(0, 8) + "01";
  const oldDays = Math.max(0, day - 1);
  const newDays = daysInMonth - oldDays;
  const oldPortion = current ? (current.monthlyTotal / daysInMonth) * oldDays : 0;
  const newPortion = (newTotal / daysInMonth) * newDays;

  function addSecondary() {
    setSecondary((prev) => [
      ...prev,
      { id: `sc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: "", amount: 0 },
    ]);
  }
  function updateSecondary(id: string, patch: Partial<SecondaryCharge>) {
    setSecondary((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function removeSecondary(id: string) {
    setSecondary((prev) => prev.filter((s) => s.id !== id));
  }

  function save() {
    setError(null);
    if (!reason.trim()) {
      setError("Please add a short reason for this change.");
      return;
    }
    if (baseRateNum < 0) {
      setError("Base rate cannot be negative.");
      return;
    }
    for (const s of secondary) {
      if (!s.name.trim()) {
        setError("Every service line item needs a name (or remove it).");
        return;
      }
    }
    const card = createRateCard({
      residentId,
      effectiveDate,
      baseRate: baseRateNum,
      locTier: tier,
      locRate: resolvedLocRate,
      locRateOverridden: overrideLoc && Number(customLocRate) !== defaults[tier],
      secondaryCharges: secondary,
      reason,
      approvedBy: "Dana Alvarez",
    });
    onSaved?.(card);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>Update rate card</SheetTitle>
          <SheetDescription>
            {residentName} · Creates a new immutable version. Previous rate cards stay in history.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Effective date */}
          <Section step={1} title="Effective date">
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Charges before this date stay on the old rate. From this date forward, the new rate applies.
            </p>
          </Section>

          {/* Base */}
          <Section step={2} title="Base room rate">
            <DollarInput value={baseRate} onChange={setBaseRate} suffix="/ month" />
          </Section>

          {/* LOC */}
          <Section step={3} title="Level of care">
            <div className="space-y-2">
              {LOC_TIER_ORDER.map((t) => {
                const checked = tier === t;
                return (
                  <label
                    key={t}
                    className={cn(
                      "flex items-center justify-between rounded-md border px-3 py-2.5 cursor-pointer transition-colors",
                      checked ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="loc"
                        checked={checked}
                        onChange={() => {
                          setTier(t);
                          setOverrideLoc(false);
                          setCustomLocRate(String(defaults[t]));
                        }}
                      />
                      <span className="text-sm font-medium">{LOC_TIER_LABEL[t]}</span>
                    </div>
                    <span className="font-mono text-sm tabular-nums text-muted-foreground">
                      {t === "none" ? "$0" : usd(defaults[t])} / mo
                    </span>
                  </label>
                );
              })}
            </div>

            {tier !== "none" && (
              <div className="mt-3">
                {!overrideLoc ? (
                  <button
                    type="button"
                    onClick={() => setOverrideLoc(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Use a custom amount for this resident instead
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Custom amount for {residentName}:</div>
                    <DollarInput value={customLocRate} onChange={setCustomLocRate} suffix="/ month" />
                    <button
                      type="button"
                      onClick={() => {
                        setOverrideLoc(false);
                        setCustomLocRate(String(defaults[tier]));
                      }}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Reset to community default ({usd(defaults[tier])})
                    </button>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Secondary services */}
          <Section step={4} title="Fixed monthly services" subtitle="Add anything that recurs every month — e.g. medication management, incontinence care.">
            {secondary.length === 0 && (
              <p className="text-xs text-muted-foreground italic mb-2">No additional monthly services yet.</p>
            )}
            <div className="space-y-2">
              {secondary.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <input
                    placeholder="Service name"
                    value={s.name}
                    onChange={(e) => updateSecondary(s.id, { name: e.target.value })}
                    className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                  <div className="flex items-center gap-1 rounded-md border border-border bg-background px-3 py-2 w-32">
                    <span className="text-muted-foreground text-sm">$</span>
                    <input
                      inputMode="decimal"
                      value={String(s.amount)}
                      onChange={(e) =>
                        updateSecondary(s.id, { amount: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })
                      }
                      className="flex-1 bg-transparent outline-none font-mono text-sm tabular-nums min-w-0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSecondary(s.id)}
                    className="text-muted-foreground hover:text-destructive p-2"
                    aria-label="Remove service"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addSecondary}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Plus size={12} /> Add a monthly service
            </button>
          </Section>

          {/* Reason */}
          <Section step={5} title="Why is this changing?">
            <input
              placeholder="e.g. Moved to Level 2 after assessment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Section>

          {/* Proration preview */}
          {showProration && (
            <div className="rounded-md border border-accent/40 bg-accent/5 p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-accent mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">This change takes effect on the {ordinal(day)}.</div>
                  <div className="text-xs text-muted-foreground">
                    {fmtMonth(effectiveDate)}'s invoice will show two line items:
                  </div>
                </div>
              </div>
              <div className="pl-6 space-y-1 font-mono text-xs tabular-nums">
                <ProrationRow
                  label={`Old rate × ${oldDays} days`}
                  formula={`${usd(current!.monthlyTotal)} ÷ ${daysInMonth} × ${oldDays}`}
                  amount={oldPortion}
                />
                <ProrationRow
                  label={`New rate × ${newDays} days`}
                  formula={`${usd(newTotal)} ÷ ${daysInMonth} × ${newDays}`}
                  amount={newPortion}
                />
                <div className="flex justify-between pt-1 border-t border-border/60 font-semibold">
                  <span>Invoice total for {fmtMonth(effectiveDate)}</span>
                  <span>{usd(oldPortion + newPortion)}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground pl-6">
                Formula: monthly rate ÷ days in month × days at that rate
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className="border-t border-border bg-background px-6 py-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">New monthly total</div>
            <div className="font-mono text-xl font-semibold tabular-nums">{usd(newTotal)}</div>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save new rate card</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ step, title, subtitle, children }: { step: number; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Step {step}</span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>}
      {children}
    </div>
  );
}

function DollarInput({ value, onChange, suffix }: { value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
      <span className="text-muted-foreground text-sm">$</span>
      <input
        inputMode="decimal"
        className="flex-1 bg-transparent outline-none font-mono text-sm tabular-nums"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
      />
      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}

function ProrationRow({ label, formula, amount }: { label: string; formula: string; amount: number }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="truncate">
        <span>{label}</span>
        <span className="text-muted-foreground"> · {formula}</span>
      </span>
      <span>{usd(amount)}</span>
    </div>
  );
}