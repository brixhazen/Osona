import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Settings2, Pencil, ClipboardCheck, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getCommunityLocDefaults,
  getCurrentRateCard,
  getRateCards,
  subscribeRateCards,
} from "@/lib/rateCardStore";
import { LOC_TIER_LABEL, type RateCard } from "@/lib/billingTypes";
import type { ResidentBilling } from "@/lib/mock/billing";
import { RateCardEditorSheet } from "./RateCardEditorSheet";
import { CommunityLocDefaultsSheet } from "./CommunityLocDefaultsSheet";

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
function usdRound(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface Props {
  residents: ResidentBilling[];
  onRateCardSaved?: (residentId: string, card: RateCard) => void;
}

export function RateCardsPanel({ residents, onRateCardSaved }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(residents[0]?.id ?? null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [defaultsOpen, setDefaultsOpen] = useState(false);
  const [tick, setTick] = useState(0); // re-render on store change

  useEffect(() => subscribeRateCards(() => setTick((t) => t + 1)), []);

  const defaults = getCommunityLocDefaults();
  const selected = residents.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      {/* Settings strip */}
      <button
        type="button"
        onClick={() => setDefaultsOpen(true)}
        className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-2.5 text-left hover:bg-secondary/40 transition-colors"
      >
        <Settings2 size={14} className="text-muted-foreground" />
        <div className="flex-1">
          <div className="text-xs font-medium">Community level-of-care defaults</div>
          <div className="text-[11px] text-muted-foreground">
            L1 {usdRound(defaults.level_1)} · L2 {usdRound(defaults.level_2)} · L3 {usdRound(defaults.level_3)}
            <span className="text-muted-foreground/70"> · pre-filled on new rate cards</span>
          </div>
        </div>
        <span className="text-xs text-primary">Edit defaults →</span>
      </button>

      <div className="grid grid-cols-[320px_1fr] gap-4">
        {/* List */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-3 py-2 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
            Residents · {residents.length}
          </div>
          {residents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-h-[640px] overflow-y-auto">
              {residents.map((r) => {
                const card = getCurrentRateCard(r.id);
                const active = r.id === selectedId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      "w-full px-3 py-2.5 text-left border-b border-border last:border-0 hover:bg-secondary/40 transition-colors flex items-center gap-2",
                      active && "bg-primary/5",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{r.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.room} · {card ? LOC_TIER_LABEL[card.locTier] : "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm tabular-nums">
                        {card ? usdRound(card.monthlyTotal) : "—"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">/ mo</div>
                    </div>
                    <ChevronRight size={12} className={cn("text-muted-foreground", active && "text-primary")} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail */}
        <div>
          {selected ? (
            <ResidentDetail
              key={`${selected.id}-${tick}`}
              resident={selected}
              onEdit={() => setEditorOpen(true)}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Select a resident to view their rate card.
            </div>
          )}
        </div>
      </div>

      {selected && (
        <RateCardEditorSheet
          open={editorOpen}
          onOpenChange={setEditorOpen}
          residentId={selected.id}
          residentName={selected.name}
          onSaved={(card) => onRateCardSaved?.(selected.id, card)}
        />
      )}

      <CommunityLocDefaultsSheet
        open={defaultsOpen}
        onOpenChange={setDefaultsOpen}
        onSaved={() => setTick((t) => t + 1)}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-10 text-center">
      <div className="text-sm font-medium mb-1">No residents yet</div>
      <div className="text-xs text-muted-foreground">
        Add residents from the Admissions module to set up their rate cards.
      </div>
    </div>
  );
}

function ResidentDetail({ resident, onEdit }: { resident: ResidentBilling; onEdit: () => void }) {
  const cards = getRateCards(resident.id);
  const current = useMemo(() => getCurrentRateCard(resident.id), [resident.id, cards.length]);
  const history = cards.filter((c) => c.id !== current?.id).slice().reverse();

  if (!current) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="text-sm font-medium mb-1">No rate card yet</div>
        <div className="text-xs text-muted-foreground mb-4">
          Create the first rate card to define this resident's recurring monthly charges.
        </div>
        <Button onClick={onEdit}>Create rate card</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current card */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              Current monthly total
            </div>
            <div className="font-mono text-3xl font-semibold tabular-nums">
              {usd(current.monthlyTotal)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Effective since {fmtDate(current.effectiveDate)}
            </div>
          </div>
          <Button size="sm" onClick={onEdit}>
            <Pencil size={12} className="mr-1.5" /> Update rate card
          </Button>
        </div>

        <div className="divide-y divide-border">
          <Group title="Base">
            <LineItem label="Base room rate" amount={current.baseRate} />
          </Group>

          <Group title="Level of care">
            {current.locTier === "none" ? (
              <div className="text-xs text-muted-foreground italic">No level-of-care charges.</div>
            ) : (
              <LineItem
                label={LOC_TIER_LABEL[current.locTier]}
                amount={current.locRate}
                meta={current.locRateOverridden ? "Custom amount for this resident" : "Community default"}
              />
            )}
          </Group>

          <Group title="Fixed monthly services">
            {current.secondaryCharges.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">No additional monthly services.</div>
            ) : (
              current.secondaryCharges.map((s) => (
                <LineItem key={s.id} label={s.name} amount={s.amount} />
              ))
            )}
          </Group>
        </div>

        <div className="px-5 py-3 bg-secondary/30 border-t border-border flex items-center gap-2 text-[11px] text-muted-foreground">
          <ClipboardCheck size={12} />
          <span>Approved by <strong className="text-foreground/80">{current.approvedBy}</strong> · {current.reason}</span>
        </div>
      </div>

      {/* History */}
      <div className="rounded-lg border border-border bg-card">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <History size={13} className="text-muted-foreground" />
          <div className="text-sm font-medium">Rate card history</div>
          <div className="text-[11px] text-muted-foreground ml-auto">
            {history.length === 0 ? "No prior versions" : `${history.length} prior version${history.length !== 1 ? "s" : ""}`}
          </div>
        </div>
        {history.length === 0 ? (
          <div className="px-5 py-6 text-xs text-muted-foreground">
            This is the first rate card. Future changes will appear here.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((c) => (
              <HistoryRow key={c.id} card={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function LineItem({ label, amount, meta }: { label: string; amount: number; meta?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className="text-sm">
        {label}
        {meta && <span className="text-[11px] text-muted-foreground ml-2">· {meta}</span>}
      </div>
      <div className="font-mono text-sm tabular-nums">{usd(amount)}</div>
    </div>
  );
}

function HistoryRow({ card }: { card: RateCard }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex-1">
          <div className="text-sm">{fmtDate(card.effectiveDate)} — {card.reason}</div>
          <div className="text-[11px] text-muted-foreground">
            {LOC_TIER_LABEL[card.locTier]} · approved by {card.approvedBy}
          </div>
        </div>
        <div className="font-mono text-sm tabular-nums">{usd(card.monthlyTotal)}</div>
        <ChevronRight size={12} className={cn("text-muted-foreground transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 bg-secondary/20 border-t border-border/60 space-y-1.5">
          <LineItem label="Base room rate" amount={card.baseRate} />
          {card.locTier !== "none" && (
            <LineItem
              label={`Level of care (${LOC_TIER_LABEL[card.locTier]})`}
              amount={card.locRate}
              meta={card.locRateOverridden ? "Custom" : "Community default"}
            />
          )}
          {card.secondaryCharges.map((s) => (
            <LineItem key={s.id} label={s.name} amount={s.amount} />
          ))}
          <div className="pt-1.5 mt-1.5 border-t border-border/60">
            <LineItem label="Monthly total" amount={card.monthlyTotal} />
          </div>
        </div>
      )}
    </div>
  );
}