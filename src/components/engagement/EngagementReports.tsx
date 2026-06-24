import { useState } from "react";
import { COMMUNITY_METRICS, RESIDENT_PROFILES } from "@/lib/mock/engagement";
import { cn } from "@/lib/utils";
import {
  BarChart3, Download, FileText, Heart, Shield,
  TrendingDown, TrendingUp, Users,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from "recharts";

type ReportCategory = "participation" | "compliance" | "at_risk" | "volunteer";

interface ReportDef {
  id: string;
  category: ReportCategory;
  title: string;
  description: string;
  lastGenerated: string;
  format: string;
}

const REPORTS: ReportDef[] = [
  // Participation
  { id: "rp01", category: "participation", title: "Monthly Participation Summary", description: "Aggregate participation rates by domain, wing, and cognitive level. Includes resident-level detail.", lastGenerated: "May 15, 2026", format: "PDF / Excel" },
  { id: "rp02", category: "participation", title: "Preference Match Analysis", description: "Comparison of resident documented preferences vs. activity programming. Identifies coverage gaps.", lastGenerated: "May 10, 2026", format: "PDF" },
  { id: "rp03", category: "participation", title: "Quality of Engagement Trend", description: "Month-over-month excellent/good/fair/refused/slept distribution. Tracks meaningful participation.", lastGenerated: "May 10, 2026", format: "PDF / Excel" },
  { id: "rp04", category: "participation", title: "Activity Program Utilization", description: "Per-activity attendance rate, cancellations, lead staff, and resident satisfaction notes.", lastGenerated: "May 15, 2026", format: "PDF" },
  // Compliance
  { id: "rp05", category: "compliance", title: "MDS 3.0 — Section F (Preferences)", description: "Activity preference assessments with dates and responsible staff. State survey–ready.", lastGenerated: "Apr 30, 2026", format: "PDF" },
  { id: "rp06", category: "compliance", title: "Activity Department Annual Plan", description: "Programming goals, domain coverage, special events, and staffing rationale for regulatory review.", lastGenerated: "Jan 1, 2026", format: "PDF / Word" },
  { id: "rp07", category: "compliance", title: "Individualized Activity Care Plans", description: "Per-resident documented plan linked to MDS preferences, engagement history, and clinical notes.", lastGenerated: "May 1, 2026", format: "PDF" },
  { id: "rp08", category: "compliance", title: "Deficiency-Free Readiness Checklist", description: "Internal audit against F679, F680 activity requirements. Highlights documentation gaps before survey.", lastGenerated: "May 12, 2026", format: "PDF" },
  // At-risk
  { id: "rp09", category: "at_risk", title: "At-Risk Engagement Alert Report", description: "All residents with 30%+ decline, missed meals, days without participation, or unnotified families.", lastGenerated: "May 16, 2026", format: "PDF" },
  { id: "rp10", category: "at_risk", title: "Participation Decline Trend", description: "6-week trend for all residents below baseline. Flagged for care plan review.", lastGenerated: "May 15, 2026", format: "PDF / Excel" },
  { id: "rp11", category: "at_risk", title: "Family Communication Gap Report", description: "Residents whose families have not logged in or received notifications in the last 7+ days.", lastGenerated: "May 16, 2026", format: "PDF" },
  // Volunteer
  { id: "rp12", category: "volunteer", title: "Volunteer Hours Log", description: "Per-volunteer hours, activities led, resident impact notes. Required for grant reporting.", lastGenerated: "May 15, 2026", format: "PDF / Excel" },
  { id: "rp13", category: "volunteer", title: "Community Partnership Summary", description: "External organizations, visit frequency, resident engagement outcomes.", lastGenerated: "Apr 30, 2026", format: "PDF" },
];

const CATEGORY_CONFIG: Record<ReportCategory, { label: string; icon: React.ReactNode }> = {
  participation: { label: "Participation", icon: <Heart size={12} /> },
  compliance:    { label: "Compliance",    icon: <Shield size={12} /> },
  at_risk:       { label: "At-Risk",       icon: <TrendingDown size={12} /> },
  volunteer:     { label: "Volunteer",     icon: <Users size={12} /> },
};

const CATEGORIES: ReportCategory[] = ["participation", "compliance", "at_risk", "volunteer"];

const QUALITY_BARS = [
  { label: "Excellent", value: COMMUNITY_METRICS.qualityDistribution.excellent, fill: "#4DB896" },
  { label: "Good",      value: COMMUNITY_METRICS.qualityDistribution.good,      fill: "#2BBFAA" },
  { label: "Fair",      value: COMMUNITY_METRICS.qualityDistribution.fair,      fill: "#F5A623" },
  { label: "Refused",   value: COMMUNITY_METRICS.qualityDistribution.refused,   fill: "#E05C5C" },
  { label: "Slept",     value: COMMUNITY_METRICS.qualityDistribution.slept,     fill: "#8A9BB0" },
];

const DOMAIN_PARTICIPATION = [
  { label: "Physical",   pct: 68 },
  { label: "Cognitive",  pct: 55 },
  { label: "Social",     pct: 74 },
  { label: "Creative",   pct: 42 },
  { label: "Spiritual",  pct: 61 },
  { label: "1:1 Visit",  pct: 38 },
  { label: "Volunteer",  pct: 22 },
];

const WEEKLY_TREND = [
  { week: "May 12", rate: 71 },
  { week: "May 19", rate: 73 },
  { week: "May 26", rate: 70 },
  { week: "Jun 2",  rate: 72 },
  { week: "Jun 9",  rate: 74 },
];

export function EngagementReports() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory | "all">("all");
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const visible = REPORTS.filter((r) => activeCategory === "all" || r.category === activeCategory);
  const byCategory = CATEGORIES.map((cat) => ({
    cat,
    reports: visible.filter((r) => r.category === cat),
  })).filter((g) => g.reports.length > 0);

  const criticalCount    = RESIDENT_PROFILES.filter((r) => r.riskLevel === "critical").length;
  const atRiskCount      = RESIDENT_PROFILES.filter((r) => r.riskLevel === "at_risk").length;
  const monitoringCount  = RESIDENT_PROFILES.filter((r) => r.riskLevel === "monitoring").length;

  return (
    <div className="flex gap-5 items-start">
      {/* Left: report catalog */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {cat === "all" ? "All Reports" : CATEGORY_CONFIG[cat].label}
              <span className="ml-1.5 font-mono opacity-60">
                {cat === "all" ? REPORTS.length : REPORTS.filter((r) => r.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* Report groups */}
        {byCategory.map(({ cat, reports }) => (
          <div key={cat} className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {CATEGORY_CONFIG[cat].icon}
              {CATEGORY_CONFIG[cat].label}
            </div>
            <div className="flex flex-col gap-1.5">
              {reports.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  isGenerated={generated.has(r.id)}
                  onGenerate={() => setGenerated((prev) => new Set([...prev, r.id]))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right: live analytics */}
      <div className="w-[300px] shrink-0 flex flex-col gap-4">
        {/* At-risk snapshot */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
            Engagement Status
          </div>
          <div className="flex flex-col gap-1.5">
            <SnapRow label="Participation Rate" value={`${COMMUNITY_METRICS.participationRate}%`} tone="ok" />
            <SnapRow label="Critical Risk" value={String(criticalCount)} tone="danger" />
            <SnapRow label="At Risk / Monitoring" value={String(atRiskCount + monitoringCount)} tone="warn" />
            <SnapRow label="Preference Match" value={`${COMMUNITY_METRICS.preferenceMatchRate}%`} />
            <SnapRow label="Avg Programs / Resident" value={String(COMMUNITY_METRICS.avgProgramsPerResident)} />
          </div>
        </div>

        {/* Quality distribution */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
            Quality Distribution (May)
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={QUALITY_BARS} barCategoryGap="20%">
              <XAxis dataKey="label" tick={{ fontSize: 8, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "11px" }}
                formatter={(v: number) => [`${v}%`]}
              />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {QUALITY_BARS.map((b) => (
                  <Cell key={b.label} fill={b.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Domain participation */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">
            Participation by Domain
          </div>
          <div className="flex flex-col gap-1.5">
            {DOMAIN_PARTICIPATION.map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-16 shrink-0">{d.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/70" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly trend */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Weekly Participation
            </div>
            <div className="flex items-center gap-1 text-[10px] text-success">
              <TrendingUp size={10} />
              <span>+3% vs prior week</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={WEEKLY_TREND} barCategoryGap="30%">
              <XAxis dataKey="week" tick={{ fontSize: 8, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[60, 80]} />
              <Tooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "11px" }}
                formatter={(v: number) => [`${v}%`, "Participation"]}
              />
              <Bar dataKey="rate" fill="var(--color-primary)" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ReportCard({
  report: r, isGenerated, onGenerate,
}: {
  report: ReportDef;
  isGenerated: boolean;
  onGenerate: () => void;
}) {
  const cfg = CATEGORY_CONFIG[r.category];

  return (
    <div className="rounded-lg border border-border bg-card p-3.5 flex items-center gap-3">
      <div className="size-8 rounded-md bg-secondary/60 grid place-items-center shrink-0 text-muted-foreground">
        <FileText size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight">{r.title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{r.description}</div>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
          <span>Last: {r.lastGenerated}</span>
          <span>{r.format}</span>
        </div>
      </div>
      <button
        onClick={isGenerated ? undefined : onGenerate}
        className={cn(
          "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border font-medium transition-colors shrink-0",
          isGenerated
            ? "border-success/40 bg-success/10 text-success"
            : "border-border text-muted-foreground hover:text-foreground hover:border-border",
        )}
      >
        <Download size={11} />
        {isGenerated ? "Ready" : "Generate"}
      </button>
    </div>
  );
}

function SnapRow({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" | "danger" }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        "font-mono font-semibold",
        tone === "danger" ? "text-destructive" : tone === "warn" ? "text-accent" : tone === "ok" ? "text-success" : "text-foreground",
      )}>
        {value}
      </span>
    </div>
  );
}
