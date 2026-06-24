import { useState } from "react";
import {
  MAINTENANCE_REPORTS, BUDGET_HISTORY, BUDGET_LINES, BUDGET_MONTHLY, BUDGET_SPENT,
  WORK_ORDERS, PM_TASKS,
  type MaintenanceReportDef,
} from "@/lib/mock/maintenance";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from "recharts";
import { Download, FileText, Wrench, Shield, DollarSign, Package } from "lucide-react";

type Category = "all" | "operations" | "compliance" | "financial" | "lifecycle";

const CATEGORY_CONFIG: Record<Exclude<Category, "all">, { label: string; icon: React.ReactNode }> = {
  operations: { label: "Operations", icon: <Wrench size={12} /> },
  compliance: { label: "Compliance", icon: <Shield size={12} /> },
  financial:  { label: "Financial",  icon: <DollarSign size={12} /> },
  lifecycle:  { label: "Lifecycle",  icon: <Package size={12} /> },
};

// Fixed hex colors for Recharts Cells
const WO_STATUS_COLORS: Record<string, string> = {
  open:        "#E87171",
  in_progress: "#2BBFAA",
  completed:   "#4AAE8A",
  scheduled:   "#7B9FD4",
  other:       "#8A9BB0",
};

const BUDGET_BAR_COLOR = "#2BBFAA";

function getWOStatusData() {
  const groups: Record<string, number> = {};
  for (const wo of WORK_ORDERS) {
    const key = wo.status === "assigned" || wo.status === "parts_ordered" || wo.status === "vendor_called"
      ? "in_progress"
      : wo.status;
    groups[key] = (groups[key] ?? 0) + 1;
  }
  return Object.entries(groups).map(([status, count]) => ({ status, count }));
}

const WO_STATUS_DATA = getWOStatusData();

export function MaintenanceReports() {
  const [category, setCategory] = useState<Category>("all");
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  const visible = MAINTENANCE_REPORTS.filter((r) => category === "all" || r.category === category);

  const byCategory = (["operations", "compliance", "financial", "lifecycle"] as Exclude<Category, "all">[]).map((cat) => ({
    cat,
    reports: visible.filter((r) => r.category === cat),
  })).filter((g) => g.reports.length > 0);

  const pmCurrent  = PM_TASKS.filter((t) => t.status === "current").length;
  const pmOverdue  = PM_TASKS.filter((t) => t.status === "overdue").length;
  const pmDueSoon  = PM_TASKS.filter((t) => t.status === "due_soon").length;

  return (
    <div className="flex gap-5 items-start">
      {/* Report catalog */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Category filter */}
        <div className="flex items-center gap-2">
          {(["all", "operations", "compliance", "financial", "lifecycle"] as Category[]).map((cat) => (
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
                {cat === "all" ? MAINTENANCE_REPORTS.length : MAINTENANCE_REPORTS.filter((r) => r.category === cat).length}
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

      {/* Right panel: live snapshots */}
      <div className="w-[260px] shrink-0 flex flex-col gap-4">
        {/* WO status breakdown */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">WO Status Breakdown</div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={WO_STATUS_DATA} barCategoryGap="25%" layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="status"
                tickFormatter={(v) => v === "in_progress" ? "In Prog." : v.charAt(0).toUpperCase() + v.slice(1)}
                tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "11px" }}
                formatter={(v: number) => [`${v} orders`]}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                {WO_STATUS_DATA.map((entry) => (
                  <Cell key={entry.status} fill={WO_STATUS_COLORS[entry.status] ?? WO_STATUS_COLORS.other} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PM summary */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">PM Completion</div>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Current",  value: pmCurrent,  cls: "text-success" },
              { label: "Due Soon", value: pmDueSoon,  cls: "text-accent" },
              { label: "Overdue",  value: pmOverdue,  cls: "text-destructive" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground w-16 shrink-0">{row.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", row.cls.replace("text-", "bg-"), "opacity-60")}
                    style={{ width: `${(row.value / PM_TASKS.length) * 100}%` }}
                  />
                </div>
                <span className={cn("font-mono font-semibold w-4 text-right shrink-0", row.cls)}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">May Budget</div>
          <div className="mb-2">
            <div className="flex items-end justify-between mb-1">
              <span className="font-display font-bold text-lg">${(BUDGET_SPENT / 1000).toFixed(1)}k</span>
              <span className="text-[10px] text-muted-foreground">of ${(BUDGET_MONTHLY / 1000).toFixed(0)}k</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${(BUDGET_SPENT / BUDGET_MONTHLY) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {BUDGET_LINES.map((line) => (
              <div key={line.category} className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">{line.category}</span>
                <span className="font-mono font-medium">${line.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-[10px] border-t border-border/50 pt-1 mt-0.5">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-mono font-semibold text-success">${(BUDGET_MONTHLY - BUDGET_SPENT).toLocaleString()}</span>
            </div>
          </div>

          {/* Spend history sparkline */}
          <div className="mt-3">
            <div className="text-[9px] text-muted-foreground mb-1.5">6-Month Spend</div>
            <ResponsiveContainer width="100%" height={50}>
              <BarChart data={BUDGET_HISTORY} barCategoryGap="15%">
                <XAxis dataKey="month" tick={{ fontSize: 8, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "10px" }}
                  formatter={(v: number) => [`$${(v / 1000).toFixed(1)}k`]}
                />
                <Bar dataKey="spent" fill={BUDGET_BAR_COLOR} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ report, generated, onGenerate }: { report: MaintenanceReportDef; generated: boolean; onGenerate: () => void }) {
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
