export type CommunityId = "slc" | "den" | "boi";

export const COMMUNITIES = [
  { id: "slc" as const, name: "Sunrise Gardens — Salt Lake City", occupancy: 0.853, beds: "87 / 102" },
  { id: "den" as const, name: "Cedar Ridge — Denver", occupancy: 0.912, beds: "83 / 91" },
  { id: "boi" as const, name: "Aspen Meadows — Boise", occupancy: 0.788, beds: "67 / 85" },
];

export const KPIS = [
  { id: "occupancy", label: "Occupancy", value: "85.3%", sub: "87 / 102 beds", trend: "down" as const, delta: "−2.8 pts WoW", prior: "88.1% last week" },
  { id: "revenue", label: "MTD Revenue", value: "$412,840", sub: "vs $398k budget", trend: "up" as const, delta: "+3.7%", prior: "$398,000 budget" },
  { id: "ar", label: "Open AR", value: "$38,200", sub: "14.2% over 90 days", trend: "down" as const, delta: "+$2.1k MoM", prior: "$36,100 last month" },
  { id: "labor", label: "Labor Cost %", value: "61.4%", sub: "of revenue", trend: "down" as const, delta: "+1.6 pts", prior: "59.8% last month" },
  { id: "leads", label: "Active Leads", value: "234", sub: "11 touring this week", trend: "up" as const, delta: "+18 WoW", prior: "216 last week" },
  { id: "training", label: "Training Compliance", value: "91%", sub: "3 staff overdue", trend: "flat" as const, delta: "—", prior: "91% last week" },
];

// 90-day occupancy series. Builds dynamically off today.
function buildOccupancy() {
  const today = new Date();
  const arr: { date: string; rate: number; census: number; event?: { type: "in" | "out"; name: string } }[] = [];
  let census = 92;
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Dip 6 weeks ago
    if (i > 38 && i < 48) census -= 0.4;
    else if (i < 38) census += 0.12;
    else census += 0.05;
    const noise = Math.sin(i / 6) * 0.6;
    const c = Math.round(Math.max(80, Math.min(95, census + noise)));
    const row: any = { date: d.toISOString().slice(0, 10), census: c, rate: +(c / 102 * 100).toFixed(1) };
    if (i === 60) row.event = { type: "in", name: "Margaret K. moved in" };
    if (i === 42) row.event = { type: "out", name: "Walter B. transitioned" };
    if (i === 41) row.event = { type: "out", name: "Eleanor S. moved out" };
    if (i === 25) row.event = { type: "in", name: "James T. moved in" };
    if (i === 10) row.event = { type: "in", name: "Doris L. moved in" };
    arr.push(row);
  }
  return arr;
}
export const OCCUPANCY_SERIES = buildOccupancy();

export const CENSUS = [
  { wing: "East Wing", occupied: 28, total: 30, nextMoveIn: "Apr 22 — Margaret Collins" },
  { wing: "West Wing", occupied: 31, total: 32, nextMoveIn: "Apr 28 — Robert Tanner" },
  { wing: "Memory Care", occupied: 18, total: 22, nextMoveIn: "May 02 — Helen Park" },
  { wing: "Independent Living", occupied: 10, total: 18, nextMoveIn: "May 06 — Frank Doyle" },
];

export const BRIEFING = [
  { time: "8:00 AM", text: "Tour — Margaret Collins family", kind: "tour" as const },
  { time: "10:00 AM", text: "Quarterly compliance audit due", kind: "task" as const },
  { time: "2:00 PM", text: "Tour — Robert Tanner family", kind: "tour" as const },
  { time: "3:30 PM", text: "Night shift starts — 1 open CNA position", kind: "task" as const },
  { time: "5:00 PM", text: "Medication review with Dr. Patel", kind: "clinical" as const },
];

export const CLINICAL_FLAGS = [
  { label: "Falls this month", value: "3", sub: "4.1 / 1,000 resident days", tone: "warn" as const },
  { label: "Unplanned weight loss", value: "2", sub: "residents flagged", tone: "warn" as const },
  { label: "Hospital transfers MTD", value: "1", sub: "vs 2 last month", tone: "ok" as const },
  { label: "Medication errors MTD", value: "0", sub: "30-day streak", tone: "good" as const },
];

export const SHIFTS = [
  { name: "Day shift", hours: "7a–3p", filled: 12, total: 12 },
  { name: "Evening shift", hours: "3p–11p", filled: 10, total: 10 },
  { name: "Night shift", hours: "11p–7a", filled: 7, total: 8, note: "1 CNA open — 3 notified" },
];

export const FUNNEL = [
  { stage: "Inquiries", value: 23 },
  { stage: "Toured", value: 11 },
  { stage: "Deposit", value: 4 },
  { stage: "Move-In (30d projected)", value: 2 },
];

export const AR_AGING = [
  { bucket: "Current", value: 28400 },
  { bucket: "30–60 days", value: 6200 },
  { bucket: "60–90 days", value: 2100 },
  { bucket: "90+ days", value: 1500 },
];

export const ALERTS = {
  incidents: [
    { id: 1, title: "Fall — Room 214 (Mr. Hayes)", at: "Today 6:42 AM", severity: "warn" as const },
    { id: 2, title: "Elopement attempt — Memory Care", at: "Yesterday 11:18 PM", severity: "warn" as const },
  ],
  tasks: [
    { id: 1, title: "Monthly fire drill log — overdue 2 days", owner: "Maintenance" },
    { id: 2, title: "MAR audit — East Wing", owner: "Clinical" },
    { id: 3, title: "Care plan review — 4 residents", owner: "Clinical" },
    { id: 4, title: "Vendor insurance certificates", owner: "Admin" },
  ],
  staffing: [
    { id: 1, title: "Night shift CNA — 11p–7a", note: "3 staff notified, awaiting confirmation", severity: "danger" as const },
  ],
};
