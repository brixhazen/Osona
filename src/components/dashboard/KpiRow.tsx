import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { KPIS } from "@/lib/mock/dashboard";
import { getTrainingMetrics } from "@/lib/appStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function KpiRow() {
  const training = getTrainingMetrics();
  const liveKpis = KPIS.map((k) =>
    k.id !== "training" ? k : {
      ...k,
      value: `${training.compliancePct}%`,
      sub: training.staffWithOverdue > 0 ? `${training.staffWithOverdue} staff overdue` : "All staff current",
    },
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {liveKpis.map((k) => {
          const TrendIcon = k.trend === "up" ? ArrowUpRight : k.trend === "down" ? ArrowDownRight : Minus;
          const trendColor =
            k.trend === "flat" ? "text-muted-foreground"
              : (k.id === "ar" || k.id === "labor")
                ? (k.trend === "up" ? "text-destructive" : "text-success")
                : (k.trend === "up" ? "text-success" : "text-destructive");
          return (
            <Tooltip key={k.id}>
              <TooltipTrigger asChild>
                <div className="rounded-lg bg-card border border-border p-4 hover:border-primary/40 transition-colors cursor-default">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
                  <div className="mt-1.5 font-mono text-2xl font-semibold leading-none">{k.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{k.sub}</div>
                  <div className={cn("flex items-center gap-1 text-[11px] mt-2 font-medium", trendColor)}>
                    <TrendIcon size={12} />
                    <span>{k.delta}</span>
                  </div>
                  <Spark id={k.id} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="text-xs">Prior period: <span className="font-mono">{k.prior}</span></div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function Spark({ id }: { id: string }) {
  // Deterministic pseudo-spark
  const seed = id.length;
  const bars = Array.from({ length: 14 }, (_, i) => 30 + ((Math.sin((i + seed) * 0.9) + 1) * 30));
  return (
    <div className="mt-3 flex items-end gap-[2px] h-6">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 rounded-sm bg-primary/40" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}
