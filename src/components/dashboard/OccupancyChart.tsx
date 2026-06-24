import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip, CartesianGrid, Scatter, ComposedChart,
} from "recharts";
import { OCCUPANCY_SERIES } from "@/lib/mock/dashboard";

const moveIns = OCCUPANCY_SERIES.filter((d) => d.event?.type === "in");
const moveOuts = OCCUPANCY_SERIES.filter((d) => d.event?.type === "out");

export function OccupancyChart() {
  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold tracking-tight">Occupancy Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 90 days · target 90%</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <Legend swatch="bg-primary" label="Census rate" />
          <Legend swatch="bg-success" label="Move-in" dot />
          <Legend swatch="bg-destructive" label="Move-out" dot />
          <Legend swatch="bg-accent" label="Target 90%" dashed />
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer>
          <ComposedChart data={OCCUPANCY_SERIES} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="hsl(0 0% 100% / 0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickFormatter={(d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              minTickGap={40}
              stroke="var(--border)"
            />
            <YAxis
              domain={[75, 100]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              tickFormatter={(v) => `${v}%`}
              stroke="var(--border)"
            />
            <ReferenceLine y={90} stroke="var(--accent)" strokeDasharray="4 4" />
            <Tooltip content={<ChartTip />} />
            <Line type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Scatter data={moveIns} dataKey="rate" fill="var(--success)" shape="circle" />
            <Scatter data={moveOuts} dataKey="rate" fill="var(--destructive)" shape="circle" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">
        Note: Census dipped 6 weeks ago following two move-outs in West Wing. Recovery underway.
      </p>
    </div>
  );
}

function Legend({ swatch, label, dashed, dot }: { swatch: string; label: string; dashed?: boolean; dot?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block ${dot ? "size-2 rounded-full" : dashed ? "w-3 h-0.5 border-t border-dashed" : "w-3 h-0.5"} ${swatch}`} />
      <span>{label}</span>
    </div>
  );
}

function ChartTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-border bg-popover/95 backdrop-blur px-3 py-2 text-xs shadow-lg">
      <div className="font-mono text-muted-foreground">
        {new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
      </div>
      <div className="font-mono text-foreground mt-0.5">{d.census} / 102 · {d.rate}%</div>
      {d.event && (
        <div className={d.event.type === "in" ? "text-success mt-1" : "text-destructive mt-1"}>
          {d.event.type === "in" ? "● Move-in" : "● Move-out"}: {d.event.name}
        </div>
      )}
    </div>
  );
}
