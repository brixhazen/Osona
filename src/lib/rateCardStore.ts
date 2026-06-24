import {
  type RateCard,
  type SecondaryCharge,
  type LocTier,
  type CommunityLocDefaults,
  type ProratedLineItem,
  computeRateCardTotal,
} from "./billingTypes";
import { RESIDENTS_BILLING } from "./mock/billing";

// ── Defaults ────────────────────────────────────────────────────────────

let COMMUNITY_LOC_DEFAULTS: CommunityLocDefaults = {
  none: 0,
  level_1: 650,
  level_2: 1_250,
  level_3: 1_950,
};

export function getCommunityLocDefaults(): CommunityLocDefaults {
  return { ...COMMUNITY_LOC_DEFAULTS };
}

export function setCommunityLocDefaults(next: Omit<CommunityLocDefaults, "none">): void {
  COMMUNITY_LOC_DEFAULTS = { none: 0, ...next };
  notify();
}

export function getDefaultLocRate(tier: LocTier): number {
  return COMMUNITY_LOC_DEFAULTS[tier];
}

// ── Store ───────────────────────────────────────────────────────────────
// Append-only per resident. Sorted ascending by effectiveDate.

const RATE_CARDS = new Map<string, RateCard[]>();

function legacyTierToEnum(legacy: string): LocTier {
  const k = legacy.trim().toLowerCase();
  if (k.includes("memory") || k.includes("level 3") || k === "high") return "level_3";
  if (k.includes("enhanced") || k.includes("level 2")) return "level_2";
  if (k.includes("moderate") || k.includes("level 1") || k === "low") return "level_1";
  return "none";
}

// Seed each existing resident with a single "current" rate card derived from
// their existing baseRate/locRate so the rest of billing keeps working.
function seed(): void {
  if (RATE_CARDS.size > 0) return;
  for (const r of RESIDENTS_BILLING) {
    const tier = legacyTierToEnum(r.locTier);
    const card: RateCard = {
      id: `rc-seed-${r.id}`,
      residentId: r.id,
      effectiveDate: r.moveInDate,
      baseRate: r.baseRate,
      locTier: tier,
      locRate: r.locRate,
      locRateOverridden: r.locRate !== COMMUNITY_LOC_DEFAULTS[tier],
      secondaryCharges: [],
      monthlyTotal: r.baseRate + r.locRate,
      reason: "Move-in rate",
      approvedBy: "Dana Alvarez",
      createdAt: `${r.moveInDate}T09:00:00Z`,
    };
    RATE_CARDS.set(r.id, [card]);
  }
}

// ── Subscriptions ───────────────────────────────────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  for (const l of listeners) l();
}
export function subscribeRateCards(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ── Reads ───────────────────────────────────────────────────────────────

export function getRateCards(residentId: string): RateCard[] {
  seed();
  return [...(RATE_CARDS.get(residentId) ?? [])].sort((a, b) =>
    a.effectiveDate.localeCompare(b.effectiveDate),
  );
}

export function getRateCardOn(residentId: string, isoDate: string): RateCard | null {
  const cards = getRateCards(residentId);
  let current: RateCard | null = null;
  for (const c of cards) {
    if (c.effectiveDate <= isoDate) current = c;
    else break;
  }
  return current;
}

export function getCurrentRateCard(residentId: string): RateCard | null {
  const today = new Date().toISOString().slice(0, 10);
  return getRateCardOn(residentId, today) ?? getRateCards(residentId).slice(-1)[0] ?? null;
}

// ── Writes ──────────────────────────────────────────────────────────────

export interface NewRateCardInput {
  residentId: string;
  effectiveDate: string;
  baseRate: number;
  locTier: LocTier;
  locRate: number;
  locRateOverridden: boolean;
  secondaryCharges: SecondaryCharge[];
  reason: string;
  approvedBy: string;
}

export function createRateCard(input: NewRateCardInput): RateCard {
  seed();
  if (!input.reason.trim()) throw new Error("Reason is required");
  if (input.baseRate < 0) throw new Error("Base rate must be non-negative");
  const card: RateCard = {
    id: `rc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    residentId: input.residentId,
    effectiveDate: input.effectiveDate,
    baseRate: input.baseRate,
    locTier: input.locTier,
    locRate: input.locRate,
    locRateOverridden: input.locRateOverridden,
    secondaryCharges: input.secondaryCharges.map((s) => ({ ...s })),
    monthlyTotal: computeRateCardTotal(input.baseRate, input.locRate, input.secondaryCharges),
    reason: input.reason.trim(),
    approvedBy: input.approvedBy,
    createdAt: new Date().toISOString(),
  };
  const list = RATE_CARDS.get(input.residentId) ?? [];
  RATE_CARDS.set(input.residentId, [...list, card]);
  notify();
  return card;
}

// ── Proration ───────────────────────────────────────────────────────────
// Formula: (monthlyRate ÷ daysInMonth) × daysAtThatRate

function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

function iso(year: number, month1to12: number, day: number): string {
  const m = String(month1to12).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function fmtRange(year: number, month1to12: number, from: number, to: number): string {
  const monthName = new Date(year, month1to12 - 1, 1).toLocaleString("en-US", { month: "short" });
  return from === to ? `${monthName} ${from}` : `${monthName} ${from}–${to}`;
}

/**
 * Returns prorated line items for a given calendar month.
 * If multiple rate cards are effective inside the month, each appears as
 * its own line item with its date range.
 */
export function prorateMonth(
  residentId: string,
  year: number,
  month1to12: number,
): ProratedLineItem[] {
  const totalDays = daysInMonth(year, month1to12);
  const monthStart = iso(year, month1to12, 1);
  const monthEnd = iso(year, month1to12, totalDays);

  const cards = getRateCards(residentId);
  // Active = the card effective at month start (if any) + any card whose
  // effectiveDate falls inside the month.
  const activeAtStart = getRateCardOn(residentId, monthStart);
  const midMonth = cards.filter(
    (c) => c.effectiveDate > monthStart && c.effectiveDate <= monthEnd,
  );

  const segments: { card: RateCard; from: number; to: number }[] = [];
  let cursor = 1;
  let currentCard = activeAtStart;

  for (const next of midMonth) {
    const switchDay = Number(next.effectiveDate.slice(8, 10));
    if (currentCard && switchDay > cursor) {
      segments.push({ card: currentCard, from: cursor, to: switchDay - 1 });
    }
    cursor = switchDay;
    currentCard = next;
  }
  if (currentCard && cursor <= totalDays) {
    segments.push({ card: currentCard, from: cursor, to: totalDays });
  }

  return segments.map<ProratedLineItem>(({ card, from, to }) => {
    const days = to - from + 1;
    const amount = (card.monthlyTotal / totalDays) * days;
    return {
      label: `Monthly rate (${fmtRange(year, month1to12, from, to)})`,
      rateCardId: card.id,
      monthlyRate: card.monthlyTotal,
      daysAtRate: days,
      daysInMonth: totalDays,
      amount: Math.round(amount * 100) / 100,
      rangeStart: iso(year, month1to12, from),
      rangeEnd: iso(year, month1to12, to),
    };
  });
}