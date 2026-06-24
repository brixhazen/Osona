import { RESIDENTS_BILLING } from "./mock/billing";
import { EMAR_RESIDENTS, MEDICATIONS, AM_ADMINISTRATIONS, CONTROLLED_COUNTS } from "./mock/emar";
import { LEADS } from "./mock/crm";
import { DINING_METRICS, WEIGHT_ALERTS, RESIDENT_DIETS } from "./mock/dining";

export function buildSystemPrompt(): string {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const residents = RESIDENTS_BILLING.map((r) =>
    `  • ${r.name} | Room ${r.room} | ${r.wing} | ${r.locTier} | $${r.monthlyTotal.toLocaleString()}/mo | Balance: $${r.currentBalance.toLocaleString()} | AR: ${r.arBucket}`,
  ).join("\n");

  const meds = EMAR_RESIDENTS.map((res) => {
    const resMeds = MEDICATIONS.filter((m) => m.residentId === res.id && m.active);
    const scheduled = resMeds.filter((m) => !m.isPrn).map((m) => `${m.name} ${m.dose} (${m.scheduledPasses.join("/")}${m.isControlled ? " — CONTROLLED Sch " + m.controlledSchedule : ""})`).join(", ");
    const prn = resMeds.filter((m) => m.isPrn).map((m) => `${m.name} ${m.dose} PRN`).join(", ");
    return `  • ${res.name} (${res.room}): Scheduled: ${scheduled || "none"}${prn ? ` | PRN: ${prn}` : ""}${res.allergies.length ? ` | ALLERGIES: ${res.allergies.join(", ")}` : ""}`;
  }).join("\n");

  const todayAdm = AM_ADMINISTRATIONS;
  const given = todayAdm.filter((a) => a.status === "given").length;
  const refused = todayAdm.filter((a) => a.status === "refused").length;
  const held = todayAdm.filter((a) => a.status === "held").length;

  const ctrlDiscrepancies = CONTROLLED_COUNTS.filter((c) => c.actualCount !== c.expectedCount);
  const ctrlSummary = ctrlDiscrepancies.length > 0
    ? ctrlDiscrepancies.map((c) => {
        const med = MEDICATIONS.find((m) => m.id === c.medicationId);
        const res = EMAR_RESIDENTS.find((r) => r.id === c.residentId);
        return `${med?.name} ${med?.dose} (${res?.name}) expected ${c.expectedCount} found ${c.actualCount}`;
      }).join("; ")
    : "All counts verified";

  const pipeline = ["inquiry", "nurturing", "toured", "applied", "deposit"].map((stage) => {
    const stageLeads = LEADS.filter((l) => l.stage === stage);
    return `  ${stage.toUpperCase()} (${stageLeads.length}): ${stageLeads.map((l) => `${l.firstName} ${l.lastName} — ${l.careInterest.replace("_", " ")} — assigned ${l.assignedTo}`).join(", ") || "empty"}`;
  }).join("\n");

  const movedIn = LEADS.filter((l) => l.stage === "moved_in");
  const lost = LEADS.filter((l) => l.stage === "lost");

  const weightAlertSummary = WEIGHT_ALERTS.map((w) =>
    `  • ${w.residentName} (${w.room}): ${w.trend} | current ${w.currentWeight}lbs | 90-day change: ${w.pctChange90Day.toFixed(1)}%`,
  ).join("\n");

  const assessmentsDue = RESIDENT_DIETS.filter((r) => r.assessmentStatus !== "current");

  return `You are an AI assistant embedded in Haven OS — an all-in-one operations platform for assisted living facilities. Today is ${today}.

You have full knowledge of all the data in the system. Answer questions clearly and concisely. When showing lists or data, use bullet points or short tables. Keep responses focused and actionable.

== NAVIGATION ==
When the user asks to go to a page, navigate somewhere, open a module, or says something like "take me to X" or "show me X page", include [navigate:/path] at the very end of your response (after your answer). Do not explain the navigation — just include the tag and let the system handle it.

Available routes:
  /                → Dashboard & Analytics
  /emar            → eMAR (Electronic Medication Administration Record)
  /crm             → CRM / Sales (Lead Pipeline)
  /billing         → Billing & Accounts Receivable
  /dining          → Dining & Nutrition
  /compliance      → Compliance & Regulatory
  /clinical        → Clinical
  /workforce       → Workforce & Staffing
  /engagement      → Resident Engagement & Activities
  /finances        → Finances
  /maintenance     → Maintenance & Work Orders
  /training        → Training (LMS)
  /settings        → Settings

== RESIDENTS (${RESIDENTS_BILLING.length} current) ==
${residents}

== MEDICATIONS (eMAR) ==
Today's AM Pass: ${given} given, ${refused} refused, ${held} held
Controlled substance counts: ${ctrlSummary}

Resident medication lists:
${meds}

== CRM PIPELINE ==
${pipeline}
Moved In this quarter: ${movedIn.map((l) => l.firstName + " " + l.lastName).join(", ") || "none"}
Lost: ${lost.map((l) => l.firstName + " " + l.lastName).join(", ") || "none"}

== DINING & NUTRITION ==
Census: ${DINING_METRICS.totalCensus} residents | Special diets: ${DINING_METRICS.specialDietCount}
Next dietitian visit: ${DINING_METRICS.nextDietitianVisit}
Assessments due: ${assessmentsDue.length} (${assessmentsDue.filter((r) => r.assessmentStatus === "overdue").length} overdue)

Weight alerts:
${weightAlertSummary}

== BILLING SUMMARY ==
Monthly revenue: $${(414300).toLocaleString()} | AR outstanding: $${(38400).toLocaleString()} | DSO: 22 days
Payer mix: 68% private pay, 15% Medicaid, 10% LTCI, 5% VA, 2% other`;
}
