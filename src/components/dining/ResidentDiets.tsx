import { useState } from "react";
import {
  RESIDENT_DIETS, DIET_CONFIG, THICKENING_CONFIG,
  type ResidentDietProfile, type DietType,
} from "@/lib/mock/dining";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, ChevronRight, Clock,
  Droplets, Scale, ShieldAlert, Stethoscope, UtensilsCrossed,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

type DietFilter = "all" | "special" | "weight_alert" | "texture" | "allergy" | "assessment_due";

const FILTERS: { id: DietFilter; label: string }[] = [
  { id: "all",            label: "All" },
  { id: "special",        label: "Special Diet" },
  { id: "weight_alert",   label: "Weight Alert" },
  { id: "texture",        label: "Texture Modified" },
  { id: "allergy",        label: "Allergy" },
  { id: "assessment_due", label: "Assessment Due" },
];

const WEIGHT_TREND_CONFIG = {
  stable:           { label: "Stable",   cls: "text-success",     icon: "→" },
  gaining:          { label: "Gaining",  cls: "text-success",     icon: "↑" },
  losing_minor:     { label: "Watching", cls: "text-muted-foreground", icon: "↓" },
  losing_alert:     { label: "Alert",    cls: "text-accent",      icon: "↓" },
  losing_critical:  { label: "Critical", cls: "text-destructive", icon: "↓↓" },
};

const ASSIST_LABELS = {
  independent: "Independent",
  setup:       "Setup Assist",
  partial:     "Partial Assist",
  full:        "Full Assist",
};

export function ResidentDiets() {
  const [filter, setFilter] = useState<DietFilter>("all");
  const [selected, setSelected] = useState<ResidentDietProfile | null>(null);

  const filtered = RESIDENT_DIETS.filter((r) => {
    switch (filter) {
      case "special":        return !(r.dietTypes.length === 1 && r.dietTypes[0] === "regular") || r.thickening !== "none";
      case "weight_alert":   return r.weightTrend === "losing_alert" || r.weightTrend === "losing_critical";
      case "texture":        return r.dietTypes.includes("mechanical_soft") || r.dietTypes.includes("pureed") || r.thickening !== "none";
      case "allergy":        return r.allergies.length > 0;
      case "assessment_due": return r.assessmentStatus !== "current";
      default: return true;
    }
  });

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const count = RESIDENT_DIETS.filter((r) => {
            switch (f.id) {
              case "special":        return !(r.dietTypes.length === 1 && r.dietTypes[0] === "regular") || r.thickening !== "none";
              case "weight_alert":   return r.weightTrend === "losing_alert" || r.weightTrend === "losing_critical";
              case "texture":        return r.dietTypes.includes("mechanical_soft") || r.dietTypes.includes("pureed") || r.thickening !== "none";
              case "allergy":        return r.allergies.length > 0;
              case "assessment_due": return r.assessmentStatus !== "current";
              default: return true;
            }
          }).length;
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
      </div>

      {/* Resident grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((r) => (
          <DietCard key={r.id} profile={r} onClick={() => setSelected(r)} />
        ))}
      </div>

      {/* Detail sheet */}
      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-[520px] sm:max-w-2xl bg-card border-l border-border overflow-y-auto">
          {selected && <DietDetail profile={selected} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function DietCard({ profile: r, onClick }: { profile: ResidentDietProfile; onClick: () => void }) {
  const trendCfg = WEIGHT_TREND_CONFIG[r.weightTrend];
  const lastWeight = r.weightHistory[r.weightHistory.length - 1];
  const isAlert = r.weightTrend === "losing_alert" || r.weightTrend === "losing_critical";
  const hasSevereAllergy = r.allergies.some((a) => a.severity === "severe");

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-4 text-left hover:border-primary/30 transition-colors flex flex-col gap-2.5",
        isAlert ? "border-destructive/30" : "border-border",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium">{r.name}</div>
          <div className="text-[11px] text-muted-foreground">{r.room} · {r.wing}</div>
        </div>
        {r.assessmentStatus !== "current" && (
          <span className={cn(
            "text-[9px] px-1.5 py-0.5 rounded border font-medium",
            r.assessmentStatus === "overdue" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-accent/10 text-accent border-accent/20",
          )}>
            {r.assessmentStatus === "overdue" ? "Overdue" : "Due Soon"}
          </span>
        )}
      </div>

      {/* Diet type badges */}
      <div className="flex flex-wrap gap-1">
        {r.dietTypes.map((dt) => {
          const cfg = DIET_CONFIG[dt];
          return (
            <span key={dt} className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", cfg.color)}>
              {cfg.abbr}
            </span>
          );
        })}
        {r.thickening !== "none" && (
          <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", THICKENING_CONFIG[r.thickening].color)}>
            {THICKENING_CONFIG[r.thickening].label} Thick
          </span>
        )}
      </div>

      {/* Allergy + weight row */}
      <div className="flex items-center gap-3 text-[10px]">
        {r.allergies.length > 0 && (
          <div className="flex items-center gap-1">
            <ShieldAlert size={10} className={hasSevereAllergy ? "text-destructive" : "text-accent"} />
            <span className={hasSevereAllergy ? "text-destructive" : "text-accent"}>
              {r.allergies.map((a) => a.allergen).join(", ")}
            </span>
          </div>
        )}
        {lastWeight && (
          <div className={cn("flex items-center gap-1 ml-auto", trendCfg.cls)}>
            <Scale size={10} />
            <span>{lastWeight.weight} lbs</span>
            <span className="font-semibold">{trendCfg.icon}</span>
          </div>
        )}
      </div>

      {r.alerts.length > 0 && (
        <div className="flex items-start gap-1.5 text-[10px] text-destructive border-t border-border/60 pt-2">
          <AlertTriangle size={10} className="shrink-0 mt-0.5" />
          <span>{r.alerts[0]}</span>
        </div>
      )}
    </button>
  );
}

function DietDetail({ profile: r }: { profile: ResidentDietProfile }) {
  const lastWeight = r.weightHistory[r.weightHistory.length - 1];
  const trendCfg = WEIGHT_TREND_CONFIG[r.weightTrend];

  return (
    <>
      <SheetHeader className="mb-5">
        <SheetTitle>{r.name}</SheetTitle>
        <SheetDescription>{r.room} · {r.wing} · {ASSIST_LABELS[r.assistLevel]}</SheetDescription>
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

        {/* Diet orders */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Diet Orders</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {r.dietTypes.map((dt) => {
              const cfg = DIET_CONFIG[dt];
              return (
                <span key={dt} className={cn("text-xs px-2 py-0.5 rounded border font-medium", cfg.color)}>
                  {cfg.label}
                </span>
              );
            })}
            {r.thickening !== "none" && (
              <span className={cn("text-xs px-2 py-0.5 rounded border font-medium", THICKENING_CONFIG[r.thickening].color)}>
                {THICKENING_CONFIG[r.thickening].label} Thick Liquids
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Ordered by {r.orderingPhysician} · {r.dietOrderDate}
          </div>
          {r.fluidRestriction && (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-accent">
              <Droplets size={11} />
              Fluid restriction: <span className="font-semibold">{r.fluidRestriction} mL/day</span>
            </div>
          )}
          {r.calorieCountOrdered && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-accent">
              <Stethoscope size={11} />
              Calorie count order active — document all meals
            </div>
          )}
        </div>

        {/* Allergies */}
        {r.allergies.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Allergies & Intolerances</div>
            <div className="flex flex-col gap-2">
              {r.allergies.map((a, i) => (
                <div key={i} className={cn(
                  "rounded-md border p-2.5",
                  a.severity === "severe" ? "border-destructive/30 bg-destructive/5"
                  : a.severity === "moderate" ? "border-accent/20 bg-accent/5"
                  : "border-border bg-secondary/20",
                )}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <ShieldAlert size={11} className={
                      a.severity === "severe" ? "text-destructive" : a.severity === "moderate" ? "text-accent" : "text-muted-foreground"
                    } />
                    <span className="text-xs font-semibold">{a.allergen}</span>
                    <span className={cn(
                      "text-[9px] px-1 py-0.5 rounded font-medium ml-auto capitalize",
                      a.severity === "severe" ? "text-destructive" : a.severity === "moderate" ? "text-accent" : "text-muted-foreground",
                    )}>
                      {a.severity}
                    </span>
                  </div>
                  {a.notes && <p className="text-[10px] text-muted-foreground leading-relaxed">{a.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferences & dislikes */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Preferences</div>
            <div className="flex flex-col gap-1">
              {r.preferences.length === 0
                ? <span className="text-[11px] text-muted-foreground">Not documented</span>
                : r.preferences.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                    <span className="text-success shrink-0">+</span>{p}
                  </div>
                ))
              }
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Dislikes</div>
            <div className="flex flex-col gap-1">
              {r.dislikes.length === 0
                ? <span className="text-[11px] text-muted-foreground">None documented</span>
                : r.dislikes.map((d, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                    <span className="text-muted-foreground shrink-0">–</span>{d}
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Weight history chart */}
        {r.weightHistory.length > 1 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Weight History</div>
              <div className={cn("flex items-center gap-1 text-[11px] font-medium", trendCfg.cls)}>
                <Scale size={11} />
                {lastWeight?.weight} lbs — {trendCfg.label}
              </div>
            </div>
            <div className="rounded-md border border-border bg-card p-3">
              <ResponsiveContainer width="100%" height={90}>
                <LineChart data={r.weightHistory}>
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "11px" }}
                    formatter={(v: number) => [`${v} lbs`]}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke={
                      r.weightTrend === "losing_critical" ? "var(--color-destructive)"
                      : r.weightTrend === "losing_alert" ? "var(--color-accent)"
                      : "var(--color-success)"
                    }
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tray card preview */}
        {r.trayCenterNotes && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Tray Card — Kitchen Notes
            </div>
            <div className="rounded-md border border-border bg-secondary/20 px-3 py-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <UtensilsCrossed size={11} className="text-muted-foreground" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">{r.name} · {r.room}</span>
                <div className="flex gap-1 ml-auto">
                  {r.dietTypes.map((dt) => (
                    <span key={dt} className={cn("text-[8px] px-1 py-0.5 rounded border font-bold", DIET_CONFIG[dt].color)}>
                      {DIET_CONFIG[dt].abbr}
                    </span>
                  ))}
                  {r.thickening !== "none" && (
                    <span className={cn("text-[8px] px-1 py-0.5 rounded border font-bold", THICKENING_CONFIG[r.thickening].color)}>
                      {THICKENING_CONFIG[r.thickening].label.toUpperCase()} THICK
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-foreground/80 leading-relaxed">{r.trayCenterNotes}</p>
            </div>
          </div>
        )}

        {/* Assessment status */}
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2.5">
          {r.assessmentStatus === "current"
            ? <CheckCircle size={12} className="text-success" />
            : r.assessmentStatus === "due_soon"
            ? <Clock size={12} className="text-accent" />
            : <AlertTriangle size={12} className="text-destructive" />
          }
          <div className="text-[11px]">
            <span className="font-medium">Nutrition Assessment: </span>
            {r.assessmentStatus === "overdue"
              ? <span className="text-destructive">Overdue — due {r.nextAssessmentDue}</span>
              : r.assessmentStatus === "due_soon"
              ? <span className="text-accent">Due {r.nextAssessmentDue}</span>
              : <span className="text-success">Current — next due {r.nextAssessmentDue}</span>
            }
          </div>
        </div>

        {/* Dietitian notes */}
        {r.dietitianNotes && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Dietitian Notes
            </div>
            <div className="rounded-md border border-border bg-secondary/20 px-3 py-2.5">
              <p className="text-[11px] text-foreground/80 leading-relaxed">{r.dietitianNotes}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
