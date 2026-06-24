import { useState } from "react";
import { DIET_CENSUS, THICKENING_CENSUS, DIET_CONFIG, THICKENING_CONFIG, DINING_METRICS } from "@/lib/mock/dining";
import { cn } from "@/lib/utils";
import { Download, FileText, Scale, ShieldCheck, Utensils, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

interface ReportDef {
  id: string;
  category: "operations" | "clinical" | "compliance";
  title: string;
  description: string;
  lastGenerated: string;
  format: string;
}

const REPORTS: ReportDef[] = [
  { id: "r01", category: "operations",  title: "Diet Census Report",              description: "Count of residents per diet type and texture modification. Used for kitchen prep planning and vendor ordering.",         lastGenerated: "May 15, 2026", format: "PDF / Excel" },
  { id: "r02", category: "operations",  title: "Monthly Meal Participation",       description: "Meal attendance by date and meal period. Identifies trends in refusals, in-room meals, and total participation rate.", lastGenerated: "May 15, 2026", format: "PDF / Excel" },
  { id: "r03", category: "operations",  title: "Thickened Liquid Order Summary",   description: "All residents with thickening orders, level (nectar/honey/pudding), ordering physician, and last review date.",      lastGenerated: "May 10, 2026", format: "PDF" },
  { id: "r04", category: "operations",  title: "Special Occasion Meal Log",        description: "Holidays, birthday celebrations, and themed meals. Documents community dining events for quality reporting.",          lastGenerated: "Apr 30, 2026", format: "PDF" },
  { id: "r05", category: "clinical",    title: "Weight Monitoring Report",          description: "All residents on weight monitoring with 30-day and 90-day trend. Flags residents with ≥5% unplanned weight loss.",    lastGenerated: "May 16, 2026", format: "PDF / Excel" },
  { id: "r06", category: "clinical",    title: "Residents with Unplanned Weight Loss", description: "Survey-ready report of all residents with significant weight loss, corrective actions, and dietitian review status.", lastGenerated: "May 16, 2026", format: "PDF" },
  { id: "r07", category: "clinical",    title: "Nutrition Assessment Due List",    description: "Residents requiring nutrition assessment in the next 30 days, including overdue assessments.",                        lastGenerated: "May 16, 2026", format: "PDF" },
  { id: "r08", category: "clinical",    title: "Calorie Count Documentation",      description: "Food and fluid intake log for residents on active calorie count orders. Required for physician review.",                lastGenerated: "May 16, 2026", format: "PDF / Excel" },
  { id: "r09", category: "clinical",    title: "Fluid Restriction Tracking",       description: "Daily fluid intake log for residents on fluid restriction orders. Includes nursing documentation.",                     lastGenerated: "May 16, 2026", format: "PDF" },
  { id: "r10", category: "compliance",  title: "MDS 3.0 — Section K Report",       description: "Swallowing and nutritional status documentation for all residents. Required for Medicaid certification facilities.",    lastGenerated: "Apr 30, 2026", format: "PDF" },
  { id: "r11", category: "compliance",  title: "Dietitian Visit & Review Log",     description: "All registered dietitian visits, residents reviewed, orders changed, and recommendations documented.",                  lastGenerated: "Apr 30, 2026", format: "PDF" },
  { id: "r12", category: "compliance",  title: "Allergy & Special Diet Audit",     description: "All resident allergies and dietary restrictions — cross-referenced with menu and tray card documentation.",           lastGenerated: "May 10, 2026", format: "PDF" },
];

type Category = "all" | "operations" | "clinical" | "compliance";

const CATEGORY_CONFIG: Record<Exclude<Category, "all">, { label: string; icon: React.ReactNode }> = {
  operations: { label: "Operations",  icon: <Utensils size={12} /> },
  clinical:   { label: "Clinical",    icon: <Scale size={12} /> },
  compliance: { label: "Compliance",  icon: <ShieldCheck size={12} /> },
};

const DIET_COLORS: Record<string, string> = {
  regular: "#8A9BB0", low_sodium: "#2BBFAA", diabetic: "#F5A623",
  renal: "#818CF8", mechanical_soft: "#7B9FD4", pureed: "#E879A6",
};

export function DiningReports() {
  const [category, setCategory] = useState<Category>("all");
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const visible = REPORTS.filter((r) => category === "all" || r.category === category);

  const byCategory = (["operations", "clinical", "compliance"] as Exclude<Category, "all">[]).map((cat) => ({
    cat,
    reports: visible.filter((r) => r.category === cat),
  })).filter((g) => g.reports.length > 0);

  return (
    <div className="flex gap-5 items-start">
      {/* Report catalog */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Category filter */}
        <div className="flex items-center gap-2">
          {(["all", "operations", "clinical", "compliance"] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                category === cat
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

        {byCategory.map(({ cat, reports }) => (
          <div key={cat} className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {CATEGORY_CONFIG[cat].icon}
              {CATEGORY_CONFIG[cat].label}
            </div>
            {reports.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-3.5 flex items-center gap-3">
                <div className="size-8 rounded-md bg-secondary/60 grid place-items-center shrink-0 text-muted-foreground">
                  <FileText size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-tight">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{r.description}</div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>Last: {r.lastGenerated}</span>
                    <span>{r.format}</span>
                  </div>
                </div>
                <button
                  onClick={() => setGenerated((prev) => new Set([...prev, r.id]))}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border font-medium transition-colors shrink-0",
                    generated.has(r.id)
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Download size={11} />
                  {generated.has(r.id) ? "Ready" : "Generate"}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Right: live snapshots */}
      <div className="w-[280px] shrink-0 flex flex-col gap-4">
        {/* Community snapshot */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Today's Snapshot</div>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Census", value: String(DINING_METRICS.totalCensus) },
              { label: "Breakfast Attendance", value: `${DINING_METRICS.breakfastAttendance} (${Math.round(DINING_METRICS.breakfastAttendance/DINING_METRICS.totalCensus*100)}%)` },
              { label: "Lunch Attendance", value: `${DINING_METRICS.lunchAttendance} (${Math.round(DINING_METRICS.lunchAttendance/DINING_METRICS.totalCensus*100)}%)` },
              { label: "Special Diets", value: `${DINING_METRICS.specialDietCount} residents` },
              { label: "Weight Alerts", value: String(DINING_METRICS.weightAlertCount), cls: "text-destructive" },
              { label: "Assessments Due", value: String(DINING_METRICS.nutritionAssessmentsDue), cls: "text-accent" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn("font-mono font-semibold", row.cls ?? "text-foreground")}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Diet census chart */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Diet Census</div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={DIET_CENSUS} barCategoryGap="25%" layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="dietType"
                tickFormatter={(v) => DIET_CONFIG[v as keyof typeof DIET_CONFIG]?.abbr ?? v}
                tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "11px" }}
                formatter={(v: number, _, props) => [
                  `${v} residents (${props.payload?.pct}%)`,
                  DIET_CONFIG[props.payload?.dietType as keyof typeof DIET_CONFIG]?.label ?? "",
                ]}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                {DIET_CENSUS.map((entry) => (
                  <Cell key={entry.dietType} fill={DIET_COLORS[entry.dietType] ?? "#8A9BB0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Thickening census */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Thickened Liquids ({THICKENING_CENSUS.reduce((s, t) => s + t.count, 0)} residents)
          </div>
          <div className="flex flex-col gap-1.5">
            {THICKENING_CENSUS.map((t) => (
              <div key={t.level} className="flex items-center gap-2 text-[11px]">
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", THICKENING_CONFIG[t.level].color)}>
                  {THICKENING_CONFIG[t.level].label}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent/60"
                    style={{ width: `${(t.count / 10) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-muted-foreground w-4 text-right">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
