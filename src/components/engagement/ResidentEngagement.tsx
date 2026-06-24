import { useState } from "react";
import {
  RESIDENT_PROFILES, DOMAIN_CONFIG, QUALITY_CONFIG, type ResidentEngagementProfile, type ActivityDomain,
} from "@/lib/mock/engagement";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { AlertTriangle, Download, Star, TrendingDown, TrendingUp, ChevronRight, Clock, Utensils } from "lucide-react";

function downloadResidentsCSV(profiles: ResidentEngagementProfile[]) {
  const header = ["Name", "Room", "Wing", "Risk Level", "Score", "This Week", "Baseline/Wk", "Last Activity"];
  const rows = profiles.map((r) => [
    r.name, r.room, r.wing,
    r.riskLevel.replace("_", " "),
    r.engagementScore,
    r.thisWeekCount,
    r.weeklyBaseline,
    r.lastActivityDate,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = "resident-engagement.csv"; a.click();
  URL.revokeObjectURL(url);
}

type RiskFilter = "all" | "critical" | "at_risk" | "monitoring" | "good" | "excellent_eng";

const RISK_CONFIG: Record<ResidentEngagementProfile["riskLevel"], { label: string; cls: string; dot: string }> = {
  critical:       { label: "Critical",   cls: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  at_risk:        { label: "At Risk",    cls: "bg-accent/10 text-accent border-accent/20", dot: "bg-accent" },
  monitoring:     { label: "Monitoring", cls: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  good:           { label: "Good",       cls: "bg-success/10 text-success border-success/20", dot: "bg-success" },
  excellent_eng:  { label: "Excellent",  cls: "bg-success/15 text-success border-success/30", dot: "bg-success" },
};

const FILTERS: { id: RiskFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "critical", label: "Critical" },
  { id: "at_risk", label: "At Risk" },
  { id: "monitoring", label: "Monitoring" },
  { id: "good", label: "Good" },
  { id: "excellent_eng", label: "Excellent" },
];

export function ResidentEngagement() {
  const [filter, setFilter] = useState<RiskFilter>("all");
  const [selected, setSelected] = useState<ResidentEngagementProfile | null>(null);

  const filtered = RESIDENT_PROFILES.filter(
    (r) => filter === "all" || r.riskLevel === filter,
  ).sort((a, b) => {
    const order = { critical: 0, at_risk: 1, monitoring: 2, good: 3, excellent_eng: 4 };
    return (order[a.riskLevel] ?? 5) - (order[b.riskLevel] ?? 5);
  });

  return (
    <>
      {/* Filter chips */}
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => {
          const count = RESIDENT_PROFILES.filter((r) => f.id === "all" || r.riskLevel === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="ml-1.5 font-mono opacity-60">{count}</span>
            </button>
          );
        })}
        <button
          onClick={() => downloadResidentsCSV(RESIDENT_PROFILES)}
          className="ml-auto flex items-center gap-1.5 h-7 px-3 text-xs font-medium border border-border rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download size={11} />
          Export CSV
        </button>
      </div>

      {/* Resident cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((r) => (
          <ResidentCard key={r.id} profile={r} onClick={() => setSelected(r)} />
        ))}
      </div>

      {/* Detail sheet */}
      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-[500px] sm:max-w-xl bg-card border-l border-border overflow-y-auto">
          {selected && <ResidentDetail profile={selected} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ResidentCard({ profile: r, onClick }: { profile: ResidentEngagementProfile; onClick: () => void }) {
  const rc = RISK_CONFIG[r.riskLevel];
  const trend = r.thisWeekCount > r.weeklyBaseline * 0.9 ? "up" : "down";
  const pctChange = Math.round(((r.thisWeekCount - r.weeklyBaseline) / r.weeklyBaseline) * 100);

  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-border bg-card p-4 text-left hover:border-primary/30 transition-colors flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium">{r.name}</div>
          <div className="text-[11px] text-muted-foreground">{r.room} · {r.wing}</div>
        </div>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", rc.cls)}>
          {rc.label}
        </span>
      </div>

      {/* Score bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">Engagement Score</span>
          <span className={cn(
            "font-mono text-sm font-semibold",
            r.riskLevel === "critical" ? "text-destructive" : r.riskLevel === "at_risk" ? "text-accent" : "text-success",
          )}>
            {r.engagementScore}/100
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", rc.dot)}
            style={{ width: `${r.engagementScore}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1">
          {trend === "up" ? <TrendingUp size={10} className="text-success" /> : <TrendingDown size={10} className="text-destructive" />}
          <span className={trend === "up" ? "text-success" : "text-destructive"}>
            {pctChange > 0 ? "+" : ""}{pctChange}% vs baseline
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={10} />
          Last: {r.lastActivityName.slice(0, 20)}
        </div>
        {r.missedMealsThisWeek > 0 && (
          <div className="flex items-center gap-1 text-destructive">
            <Utensils size={10} />
            {r.missedMealsThisWeek} meals missed
          </div>
        )}
      </div>

      {r.alerts.length > 0 && (
        <div className="flex items-start gap-1.5 text-[10px] text-destructive/80 border-t border-border/60 pt-2">
          <AlertTriangle size={10} className="shrink-0 mt-0.5" />
          <span>{r.alerts[0]}</span>
        </div>
      )}
    </button>
  );
}

function ResidentDetail({ profile: r }: { profile: ResidentEngagementProfile }) {
  const rc = RISK_CONFIG[r.riskLevel];

  const chartData = r.participationHistory.map((w) => ({
    week: w.week,
    count: w.count,
    quality: w.avgQuality,
  }));

  return (
    <>
      <SheetHeader className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <SheetTitle>{r.name}</SheetTitle>
            <SheetDescription>{r.room} · {r.wing} · {r.cognitiveStatus}</SheetDescription>
          </div>
          <div className="text-right">
            <div className={cn(
              "font-mono text-3xl font-bold",
              r.riskLevel === "critical" ? "text-destructive" : r.riskLevel === "at_risk" ? "text-accent" : "text-success",
            )}>
              {r.engagementScore}
            </div>
            <div className="text-[10px] text-muted-foreground">/ 100</div>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", rc.cls)}>{rc.label}</span>
          </div>
        </div>
      </SheetHeader>

      <div className="space-y-5">
        {/* Alerts */}
        {r.alerts.length > 0 && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-destructive mb-1.5">Active Alerts</div>
            {r.alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[11px] text-destructive">
                <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                {a}
              </div>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="This Week" value={String(r.thisWeekCount)} sub={`baseline ${r.weeklyBaseline}/wk`} />
          <StatBox label="Last Activity" value={r.lastActivityDate.slice(5)} sub={r.lastActivityName.slice(0, 18)} />
          <StatBox label="Missed Meals" value={String(r.missedMealsThisWeek)} sub="this week" warn={r.missedMealsThisWeek > 1} />
        </div>

        {/* 30-day participation trend */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Participation Trend — Last 5 Weeks</div>
          <div className="rounded-md border border-border bg-card p-3">
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData}>
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={20} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "11px" }}
                  formatter={(v: number) => [v, "Activities"]}
                />
                <ReferenceLine y={r.weeklyBaseline} stroke="var(--color-muted-foreground)" strokeDasharray="3 3" label={{ value: "Baseline", fontSize: 8, fill: "var(--color-muted-foreground)" }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={r.riskLevel === "critical" ? "var(--color-destructive)" : r.riskLevel === "at_risk" ? "var(--color-accent)" : "var(--color-success)"}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Preference domains */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Activity Preferences</div>
          <div className="flex flex-col gap-1.5">
            {[...r.preferences].sort((a, b) => b.score - a.score).map((p) => {
              const cfg = DOMAIN_CONFIG[p.domain];
              return (
                <div key={p.domain} className="flex items-center gap-2">
                  <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: cfg.hex }} />
                  <span className="text-xs text-muted-foreground w-20">{cfg.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.score * 10}%`, backgroundColor: cfg.hex }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{p.score}/10</span>
                </div>
              );
            })}
          </div>
          {r.preferenceNotes && (
            <div className="mt-2 text-[11px] text-muted-foreground bg-secondary/40 rounded-md px-3 py-2 leading-relaxed">
              {r.preferenceNotes}
            </div>
          )}
        </div>

        {/* 1:1 visit log */}
        {r.oneToOneLogs.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              1:1 Visit Log ({r.oneToOneLogs.length})
            </div>
            <div className="flex flex-col gap-3">
              {r.oneToOneLogs.map((v, i) => (
                <div key={i} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-xs font-medium">{v.date} · {v.staff}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{v.durationMin} min</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", QUALITY_CONFIG[v.quality].cls)}>
                        {QUALITY_CONFIG[v.quality].label}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{v.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function StatBox({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-2.5">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-lg font-semibold", warn ? "text-destructive" : "text-foreground")}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
