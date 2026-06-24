import { CENSUS } from "@/lib/mock/dashboard";

export function CensusTable() {
  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display font-semibold tracking-tight">Census by Wing</h3>
        <span className="text-xs text-muted-foreground">As of today</span>
      </div>
      <div className="space-y-3">
        {CENSUS.map((row) => {
          const pct = (row.occupied / row.total) * 100;
          const available = row.total - row.occupied;
          return (
            <div key={row.wing} className="grid grid-cols-12 gap-3 items-center text-sm">
              <div className="col-span-3">
                <div className="font-medium">{row.wing}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{row.occupied}/{row.total}</div>
              </div>
              <div className="col-span-5">
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="col-span-1 text-right font-mono text-xs text-muted-foreground">
                {available} open
              </div>
              <div className="col-span-3 text-right text-[11px] text-muted-foreground truncate">
                Next: {row.nextMoveIn}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
