import { useState } from "react";
import {
  type WeightAlert, type WeightTrend, type ResidentDietProfile,
} from "@/lib/mock/dining";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, Clock, Scale,
  TrendingDown, TrendingUp, Minus,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  alerts: WeightAlert[];
  diets: ResidentDietProfile[];
  onLogWeight: (residentId: string, weight: number) => void;
  onMarkAssessmentComplete: (residentId: string) => void;
  onOrderCalorieCount: (residentId: string) => void;
}

const TREND_CONFIG: Record<WeightTrend, { label: string; icon: React.ReactNode; cls: string }> = {
  stable:          { label: "Stable",   icon: <Minus size={11} />,       cls: "text-success" },
  gaining:         { label: "Gaining",  icon: <TrendingUp size={11} />,   cls: "text-success" },
  losing_minor:    { label: "Watching", icon: <TrendingDown size={11} />, cls: "text-muted-foreground" },
  losing_alert:    { label: "Alert",    icon: <TrendingDown size={11} />, cls: "text-accent" },
  losing_critical: { label: "Critical", icon: <TrendingDown size={11} />, cls: "text-destructive" },
};

export function WeightMonitoring({ alerts, diets, onLogWeight, onMarkAssessmentComplete, onOrderCalorieCount }: Props) {
  const allTracked = diets.filter((r) => r.weightHistory.length >= 2);

  return (
    <div className="flex flex-col gap-5">
      {/* Alert cards */}
      <div className="flex flex-col gap-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Weight Loss Alerts ({alerts.filter((w) => w.trend !== "losing_minor").length})
        </div>
        <div className="grid grid-cols-3 gap-3">
          {alerts.map((alert) => (
            <WeightAlertCard
              key={alert.residentId}
              alert={alert}
              onLogWeight={(w) => onLogWeight(alert.residentId, w)}
              onOrderCalorieCount={() => onOrderCalorieCount(alert.residentId)}
            />
          ))}
        </div>
      </div>

      {/* Full weight table */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          All Residents on Weight Monitoring ({allTracked.length})
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px_80px] gap-0 border-b border-border bg-secondary/40">
            {["Resident", "Dec", "Jan–Feb", "Mar–Apr", "Jun", "30-Day %", "Trend", "Assessment"].map((h) => (
              <div key={h} className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">{h}</div>
            ))}
          </div>
          <div className="divide-y divide-border/50">
            {allTracked
              .sort((a, b) => {
                const order: Record<WeightTrend, number> = {
                  losing_critical: 0, losing_alert: 1, losing_minor: 2, stable: 3, gaining: 4,
                };
                return (order[a.weightTrend] ?? 5) - (order[b.weightTrend] ?? 5);
              })
              .map((r) => {
                const trend = TREND_CONFIG[r.weightTrend];
                const wh = r.weightHistory;
                const dec = wh.find((w) => w.month === "Dec")?.weight;
                const jan = wh.find((w) => w.month === "Jan")?.weight;
                const mar = wh.find((w) => w.month === "Mar")?.weight;
                const jun = wh.find((w) => w.month === "Jun")?.weight;
                const prev = wh.length >= 2 ? wh[wh.length - 2].weight : jun;
                const pct30 = prev && jun ? ((jun - prev) / prev * 100).toFixed(1) : "—";
                const isAlert = r.weightTrend === "losing_alert" || r.weightTrend === "losing_critical";

                return (
                  <div
                    key={r.id}
                    className={cn(
                      "grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px_80px] gap-0",
                      isAlert ? "bg-destructive/3" : "",
                    )}
                  >
                    <div className="px-3 py-2.5">
                      <div className="text-xs font-medium">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground">{r.room}</div>
                    </div>
                    <div className="px-3 py-2.5 text-xs font-mono text-muted-foreground">{dec ?? "—"}</div>
                    <div className="px-3 py-2.5 text-xs font-mono text-muted-foreground">{jan ?? "—"}</div>
                    <div className="px-3 py-2.5 text-xs font-mono text-muted-foreground">{mar ?? "—"}</div>
                    <div className="px-3 py-2.5 text-xs font-mono font-semibold">{jun ?? "—"}</div>
                    <div className={cn("px-3 py-2.5 text-xs font-mono font-semibold", isAlert ? "text-destructive" : "text-muted-foreground")}>
                      {typeof pct30 === "string" ? pct30 : `${Number(pct30) > 0 ? "+" : ""}${pct30}%`}
                    </div>
                    <div className={cn("px-3 py-2.5 flex items-center gap-1 text-[10px] font-medium", trend.cls)}>
                      {trend.icon}
                      {trend.label}
                    </div>
                    <div className="px-3 py-2.5">
                      {r.assessmentStatus === "current"
                        ? <CheckCircle size={11} className="text-success" />
                        : r.assessmentStatus === "due_soon"
                        ? <div className="flex items-center gap-1 text-[9px] text-accent"><Clock size={9} /> Due Soon</div>
                        : <div className="flex items-center gap-1 text-[9px] text-destructive"><AlertTriangle size={9} /> Overdue</div>
                      }
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Assessment due list */}
      {diets.filter((r) => r.assessmentStatus !== "current").length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Nutrition Assessments Due
          </div>
          <div className="grid grid-cols-2 gap-2">
            {diets.filter((r) => r.assessmentStatus !== "current").map((r) => (
              <div
                key={r.id}
                className={cn(
                  "rounded-lg border p-3 flex items-center gap-3",
                  r.assessmentStatus === "overdue" ? "border-destructive/30 bg-destructive/5" : "border-accent/20 bg-accent/5",
                )}
              >
                <div className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0",
                  r.assessmentStatus === "overdue" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent",
                )}>
                  {r.assessmentStatus === "overdue" ? <AlertTriangle size={13} /> : <Clock size={13} />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground">{r.room}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className={cn(
                    "text-[10px] font-medium",
                    r.assessmentStatus === "overdue" ? "text-destructive" : "text-accent",
                  )}>
                    {r.assessmentStatus === "overdue" ? "Overdue" : "Due Soon"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{r.nextAssessmentDue}</div>
                  <button
                    onClick={() => onMarkAssessmentComplete(r.id)}
                    className="text-[9px] px-2 py-0.5 rounded border border-success/30 text-success hover:bg-success/10 transition-colors"
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeightAlertCard({
  alert: a,
  onLogWeight,
  onOrderCalorieCount,
}: {
  alert: WeightAlert;
  onLogWeight: (weight: number) => void;
  onOrderCalorieCount: () => void;
}) {
  const [logging, setLogging] = useState(false);
  const [inputVal, setInputVal] = useState(String(a.currentWeight));

  const isCritical = a.trend === "losing_critical";
  const isAlert = a.trend === "losing_alert";
  const trendCfg = TREND_CONFIG[a.trend];
  const lowestWeight = Math.min(...a.history.map((h) => h.weight));
  const highestWeight = Math.max(...a.history.map((h) => h.weight));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(inputVal);
    if (!isNaN(num) && num > 0) {
      onLogWeight(num);
      setLogging(false);
    }
  }

  return (
    <div className={cn(
      "rounded-lg border p-4",
      isCritical ? "border-destructive/40 bg-destructive/5"
      : isAlert ? "border-accent/30 bg-accent/5"
      : "border-border bg-card",
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm font-medium">{a.residentName}</div>
          <div className="text-[11px] text-muted-foreground">{a.room} · {a.wing}</div>
        </div>
        <div className={cn("flex items-center gap-1 text-[10px] font-medium", trendCfg.cls)}>
          {trendCfg.icon}
          {trendCfg.label}
        </div>
      </div>

      {/* Weight stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="font-mono text-lg font-bold text-foreground">{a.currentWeight}</div>
          <div className="text-[9px] text-muted-foreground">Current (lbs)</div>
        </div>
        <div className="text-center">
          <div className={cn("font-mono text-lg font-bold", isCritical ? "text-destructive" : "text-accent")}>
            {a.pctChange90Day.toFixed(1)}%
          </div>
          <div className="text-[9px] text-muted-foreground">vs. baseline</div>
        </div>
        <div className="text-center">
          <div className={cn("font-mono text-lg font-bold", Math.abs(a.pctChange30Day) >= 5 ? "text-destructive" : "text-accent")}>
            {a.pctChange30Day.toFixed(1)}%
          </div>
          <div className="text-[9px] text-muted-foreground">30-day</div>
        </div>
      </div>

      {/* Sparkline */}
      <ResponsiveContainer width="100%" height={70}>
        <LineChart data={a.history}>
          <XAxis dataKey="month" tick={{ fontSize: 8, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[lowestWeight - 2, highestWeight + 2]} />
          <Tooltip
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "10px" }}
            formatter={(v: number) => [`${v} lbs`]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={isCritical ? "var(--color-destructive)" : isAlert ? "var(--color-accent)" : "var(--color-muted-foreground)"}
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-[10px]">
          {a.calorieCountOrdered ? (
            <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-medium">
              Calorie Count Active
            </span>
          ) : (
            <button
              onClick={onOrderCalorieCount}
              className="px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 font-medium transition-colors"
            >
              Order Calorie Count
            </button>
          )}
          {a.dietitianReviewDate && (
            <span className="text-muted-foreground ml-auto">
              <Scale size={9} className="inline mr-0.5" />
              RD visit {a.dietitianReviewDate.slice(5)}
            </span>
          )}
        </div>

        {/* Log Weight */}
        {!logging ? (
          <button
            onClick={() => { setLogging(true); setInputVal(String(a.currentWeight)); }}
            className="w-full text-[10px] py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            Log Weight
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
            <input
              type="number"
              step="0.1"
              min="50"
              max="500"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              autoFocus
              className="flex-1 h-7 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-[10px] text-muted-foreground shrink-0">lbs</span>
            <button
              type="submit"
              className="h-7 px-2.5 rounded bg-primary text-primary-foreground text-[10px] font-medium hover:bg-primary/90 transition-colors shrink-0"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setLogging(false)}
              className="h-7 px-2 rounded border border-border text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              ✕
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
