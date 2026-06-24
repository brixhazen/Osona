import { FUNNEL } from "@/lib/mock/dashboard";

export function SalesFunnel() {
  const max = FUNNEL[0].value;
  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display font-semibold tracking-tight">Sales Pipeline</h3>
        <span className="text-xs text-muted-foreground">Last 30 days</span>
      </div>
      <div className="space-y-2">
        {FUNNEL.map((f, i) => {
          const w = (f.value / max) * 100;
          const conv = i > 0 ? ((f.value / FUNNEL[i - 1].value) * 100).toFixed(0) : null;
          return (
            <div key={f.stage}>
              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground w-44 shrink-0 truncate">{f.stage}</div>
                <div className="flex-1 h-8 bg-secondary/50 rounded">
                  <div
                    className="h-full rounded bg-gradient-to-r from-primary/80 to-primary flex items-center justify-end pr-3 text-xs font-mono font-semibold text-primary-foreground"
                    style={{ width: `${w}%` }}
                  >
                    {f.value}
                  </div>
                </div>
              </div>
              {conv && (
                <div className="ml-44 pl-3 text-[10px] text-muted-foreground font-mono mt-0.5">
                  ↳ {conv}% conversion from {FUNNEL[i - 1].stage}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
