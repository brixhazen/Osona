import { getWorkforceMetrics } from "@/lib/appStore";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PERIOD_LABELS: Record<string, string> = {
  Day:     "Day shift",
  Evening: "Evening shift",
  Night:   "Night shift",
};

const PERIOD_HOURS: Record<string, string> = {
  Day:     "7a – 3p",
  Evening: "3p – 11p",
  Night:   "11p – 7a",
};

export function WorkforceSnapshot() {
  const { shiftSummary, openShiftsCount, ppd, ppdStatus } = getWorkforceMetrics();

  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display font-semibold tracking-tight">Workforce Snapshot</h3>
        {openShiftsCount > 0 && (
          <span className="text-xs font-medium text-accent">{openShiftsCount} open shift{openShiftsCount !== 1 ? "s" : ""}</span>
        )}
      </div>
      <div className="space-y-4">
        {shiftSummary.map((s) => {
          const open = s.total - s.filled;
          const fullyStaffed = open === 0;
          return (
            <div key={s.period}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  {fullyStaffed
                    ? <CheckCircle2 size={14} className="text-success" />
                    : <AlertCircle size={14} className="text-destructive" />}
                  <span className="font-medium">{PERIOD_LABELS[s.period] ?? s.period}</span>
                  <span className="text-xs text-muted-foreground font-mono">{PERIOD_HOURS[s.period] ?? ""}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{s.filled}/{s.total}</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: s.total }).map((_, i) => (
                  <div
                    key={i}
                    className={cn("flex-1 h-2 rounded-sm", i < s.filled ? "bg-primary" : "bg-destructive/40")}
                  />
                ))}
              </div>
              {!fullyStaffed && (
                <div className="text-[11px] text-destructive mt-1">{open} slot{open !== 1 ? "s" : ""} unfilled</div>
              )}
            </div>
          );
        })}
      </div>
      <div className={cn(
        "mt-4 pt-3 border-t border-border flex items-center justify-between text-xs",
        ppdStatus === "danger" ? "text-destructive" : ppdStatus === "warn" ? "text-accent" : "text-success",
      )}>
        <span className="text-muted-foreground">PPD today</span>
        <span className="font-mono font-semibold">{ppd.toFixed(2)} {ppdStatus === "danger" ? "— below min" : ppdStatus === "warn" ? "— below target" : "— on target"}</span>
      </div>
    </div>
  );
}
