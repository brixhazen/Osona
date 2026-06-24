import { STAFF, type StaffMember, type StaffRole, type ShiftPeriod } from "./mock/workforce";

export interface Eligibility {
  staff: StaffMember;
  score: number;
  warnings: string[];
  blocked: boolean;
}

export function scoreStaff(
  s: StaffMember,
  role: StaffRole,
  period: ShiftPeriod,
  assignedShifts?: Map<string, ShiftPeriod>,
): Eligibility {
  if (s.role !== role) return { staff: s, score: -1, warnings: [], blocked: true };

  // Effective shift: mock todayShift takes precedence, then any UI assignment
  const effectiveTodayShift = s.todayShift ?? assignedShifts?.get(s.id) ?? null;

  if (effectiveTodayShift === period) return { staff: s, score: -1, warnings: ["Already on this shift"], blocked: true };

  const warnings: string[] = [];
  let blocked = false;
  let pts = 100;

  const expiredCert = s.certifications.find((c) => c.status === "expired");
  if (expiredCert) { warnings.push(`Expired: ${expiredCert.name}`); blocked = true; pts -= 50; }

  const expiring = s.certifications.find((c) => c.status === "expiring_soon");
  if (expiring && !expiredCert) { warnings.push(`Expiring: ${expiring.name}`); pts -= 8; }

  const hoursLeft = s.overtimeThreshold - s.hoursThisWeek;
  if (hoursLeft <= 0) { warnings.push("At OT limit"); blocked = true; pts -= 40; }
  else if (hoursLeft <= 4) { warnings.push(`${hoursLeft}h to OT`); pts -= 18; }
  else if (hoursLeft <= 8) { warnings.push(`${hoursLeft}h available`); pts -= 6; }
  else pts += 5;

  if (s.consecutiveDays >= 7) { warnings.push("7-day limit reached"); blocked = true; pts -= 30; }
  else if (s.consecutiveDays >= 6) { warnings.push(`${s.consecutiveDays} consecutive days`); pts -= 14; }
  else if (s.consecutiveDays >= 5) { warnings.push(`${s.consecutiveDays} consecutive days`); pts -= 6; }

  if (effectiveTodayShift && effectiveTodayShift !== period) { warnings.push(`On ${effectiveTodayShift} shift today`); pts -= 22; }

  if (s.status === "prn" && !effectiveTodayShift) pts += 15;
  if (s.status === "part_time" && !effectiveTodayShift) pts += 8;

  return { staff: s, score: Math.max(0, pts), warnings, blocked };
}

export function getTopPicks(
  role: StaffRole,
  period: ShiftPeriod,
  limit = 3,
  assignedShifts?: Map<string, ShiftPeriod>,
): Eligibility[] {
  return STAFF
    .map((s) => scoreStaff(s, role, period, assignedShifts))
    .filter((e) => e.score >= 0 && !e.blocked)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
