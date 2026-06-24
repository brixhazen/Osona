import { AR_AGING } from "@/lib/mock/dashboard";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["var(--primary)", "var(--accent)", "oklch(0.7 0.16 50)", "var(--destructive)"];
const TOTAL = AR_AGING.reduce((s, x) => s + x.value, 0);

export function ArAging() {
  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display font-semibold tracking-tight">AR Aging</h3>
        <span className="text-xs text-muted-foreground font-mono">${TOTAL.toLocaleString()} total</span>
      </div>
      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="h-[180px] relative">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={AR_AGING}
                dataKey="value"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
              >
                {AR_AGING.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Open AR</div>
              <div className="font-mono text-base font-semibold">${(TOTAL / 1000).toFixed(1)}k</div>
            </div>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          {AR_AGING.map((a, i) => (
            <li key={a.bucket} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm" style={{ background: COLORS[i] }} />
                <span className="text-foreground/80">{a.bucket}</span>
              </span>
              <span className="font-mono text-xs">${a.value.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
