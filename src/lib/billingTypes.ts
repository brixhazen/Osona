// ── Rate Card domain types ──────────────────────────────────────────────
// Designed to map cleanly to a Cloud table later. All amounts are USD,
// rate cards are append-only — never edit, always create a new version.

export type LocTier = "none" | "level_1" | "level_2" | "level_3";

export const LOC_TIER_LABEL: Record<LocTier, string> = {
  none: "None",
  level_1: "Level 1",
  level_2: "Level 2",
  level_3: "Level 3",
};

export const LOC_TIER_ORDER: LocTier[] = ["none", "level_1", "level_2", "level_3"];

export interface CommunityLocDefaults {
  none: 0;
  level_1: number;
  level_2: number;
  level_3: number;
}

export interface SecondaryCharge {
  id: string;
  name: string;     // e.g. "Medication management"
  amount: number;   // monthly $
}

export interface RateCard {
  id: string;
  residentId: string;
  effectiveDate: string;         // ISO yyyy-mm-dd; immutable
  baseRate: number;
  locTier: LocTier;
  locRate: number;               // resolved at write-time
  locRateOverridden: boolean;    // true if not the community default
  secondaryCharges: SecondaryCharge[];
  monthlyTotal: number;          // baseRate + locRate + sum(secondary)
  reason: string;                // "Move-in", "LOC change", ...
  approvedBy: string;
  createdAt: string;             // ISO datetime
}

export interface ProratedLineItem {
  label: string;                 // "Base + Level 1 (Oct 1–13)"
  rateCardId: string;
  monthlyRate: number;
  daysAtRate: number;
  daysInMonth: number;
  amount: number;                // monthlyRate / daysInMonth * daysAtRate
  rangeStart: string;            // ISO
  rangeEnd: string;              // ISO (inclusive)
}

export function computeRateCardTotal(
  baseRate: number,
  locRate: number,
  secondaryCharges: SecondaryCharge[],
): number {
  const secondaryTotal = secondaryCharges.reduce((s, c) => s + (c.amount || 0), 0);
  return baseRate + locRate + secondaryTotal;
}