import { useState } from "react";
import {
  TRAINING_REPORTS, STAFF, COURSES,
  getStaffCompletionPct, getStaffOverdueCount,
  type TrainingReportDef,
} from "@/lib/mock/training";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from "recharts";
import { Award, Download, FileText, Shield, Users, BookOpen } from "lucide-react";

type Category = "all" | "compliance" | "individual" | "certification" | "operations";

const CATEGORY_CONFIG: Record<Exclude<Category, "all">, { label: string; icon: React.ReactNode }> = {
  compliance:   { label: "Compliance",   icon: <Shield size={12} /> },
  individual:   { label: "Individual",   icon: <Users size={12} /> },
  certification:{ label: "Certification",icon: <Award size={12} /> },
  operations:   { label: "Operations",   icon: <BookOpen size={12} /> },
};

// Fixed hex colors for Recharts Cells
const COMPLETION_COLORS: Record<string, string> = {
  high:   "#4AAE8A",
  mid:    "#F5A623",
  low:    "#E87171",
};

function getColor(pct: number): string {
  if (pct >= 80) return COMPLETION_COLORS.high;
  if (pct >= 60) return COMPLETION_COLORS.mid;
  return COMPLETION_COLORS.low;
}

const DEPT_COMPLETION = [
  { dept: "Nursing",     pct: Math.round(STAFF.filter((s) => s.department === "nursing").reduce((a, s) => a + getStaffCompletionPct(s), 0) / STAFF.filter((s) => s.department === "nursing").length) },
  { dept: "Dietary",     pct: Math.round(STAFF.filter((s) => s.department === "dietary").reduce((a, s) => a + getStaffCompletionPct(s), 0) / STAFF.filter((s) => s.department === "dietary").length) },
  { dept: "Activities",  pct: Math.round(STAFF.filter((s) => s.department === "activities").reduce((a, s) => a + getStaffCompletionPct(s), 0) / STAFF.filter((s) => s.department === "activities").length) },
  { dept: "Maintenance", pct: Math.round(STAFF.filter((s) => s.department === "maintenance").reduce((a, s) => a + getStaffCompletionPct(s), 0) / STAFF.filter((s) => s.department === "maintenance").length) },
];

export function TrainingReports() {
  const [category, setCategory] = useState<Category>("all");
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const visible = TRAINING_REPORTS.filter((r) => category === "all" || r.category === category);

  const byCategory = (["compliance", "individual", "certification", "operations"] as Exclude<Category, "all">[]).map((cat) => ({
    cat,
    reports: visible.filter((r) => r.category === cat),
  })).filter((g) => g.reports.length > 0);

  const totalOverdue = STAFF.reduce((a, s) => a + getStaffOverdueCount(s), 0);
  const overallPct = Math.round(STAFF.reduce((a, s) => a + getStaffCompletionPct(s), 0) / STAFF.length);

  return (
    <div className="flex gap-5 items-start">
      {/* Report catalog */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Category filter */}
        <div className="flex items-center gap-2">
          {(["all", "compliance", "individual", "certification", "operations"] as Category[]).map((cat) => (
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
                {cat === "all" ? TRAINING_REPORTS.length : TRAINING_REPORTS.filter((r) => r.category === cat).length}
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
              <ReportCard key={r.id} report={r} generated={generated.has(r.id)} onGenerate={() => setGenerated((prev) => new Set([...prev, r.id]))} />
            ))}
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div className="w-[260px] shrink-0 flex flex-col gap-4">
        {/* Live snapshot */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Today's Snapshot</div>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Total Staff",       value: String(STAFF.length),     cls: "text-foreground" },
              { label: "Overall Compliance",value: `${overallPct}%`,          cls: overallPct >= 80 ? "text-success" : "text-accent" },
              { label: "Overdue Courses",   value: String(totalOverdue),     cls: "text-destructive" },
              { label: "Active Certs",      value: String(STAFF.flatMap((s) => s.certifications).filter((c) => c.status === "current").length), cls: "text-success" },
              { label: "Expiring 60 Days",  value: String(STAFF.flatMap((s) => s.certifications).filter((c) => c.status === "expiring_soon").length), cls: "text-accent" },
              { label: "Expired Certs",     value: String(STAFF.flatMap((s) => s.certifications).filter((c) => c.status === "expired").length), cls: "text-destructive" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn("font-mono font-semibold", row.cls)}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dept completion chart */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Completion by Dept</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={DEPT_COMPLETION} barCategoryGap="25%" layout="vertical">
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis
                type="category"
                dataKey="dept"
                tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={62}
              />
              <Tooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "11px" }}
                formatter={(v: number) => [`${v}%`, "Completion"]}
              />
              <Bar dataKey="pct" radius={[0, 3, 3, 0]}>
                {DEPT_COMPLETION.map((entry) => (
                  <Cell key={entry.dept} fill={getColor(entry.pct)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* In-service hours bar */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">In-Service Hours (YTD)</div>
          <div className="flex flex-col gap-2">
            {STAFF.map((s) => {
              const pct = Math.min(100, (s.inServiceHoursYTD / s.inServiceHoursRequired) * 100);
              return (
                <div key={s.id} className="flex items-center gap-2 text-[10px]">
                  <span className="text-muted-foreground w-20 truncate shrink-0">{s.name.split(" ")[0]}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", pct >= 100 ? "bg-success/70" : pct >= 70 ? "bg-primary/60" : "bg-accent/60")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-muted-foreground w-8 text-right">{s.inServiceHoursYTD}h</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ report, generated, onGenerate }: { report: TrainingReportDef; generated: boolean; onGenerate: () => void }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3.5 flex items-center gap-3">
      <div className="size-8 rounded-md bg-secondary/60 grid place-items-center shrink-0 text-muted-foreground">
        <FileText size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-tight">{report.title}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{report.description}</div>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
          <span>Last: {report.lastGenerated}</span>
          <span>{report.format}</span>
        </div>
      </div>
      <button
        onClick={onGenerate}
        className={cn(
          "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border font-medium transition-colors shrink-0",
          generated
            ? "border-success/40 bg-success/10 text-success"
            : "border-border text-muted-foreground hover:text-foreground",
        )}
      >
        <Download size={11} />
        {generated ? "Ready" : "Generate"}
      </button>
    </div>
  );
}
