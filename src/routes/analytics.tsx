import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Activity, Heart } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

const MODULE_COLOR = "#A78BFA";

const KPIS = [
  { label: "Census", value: "92.4%", delta: "+1.2%", up: true, icon: Users, sub: "vs last month" },
  { label: "Revenue / Occupied Bed", value: "$6,840", delta: "+$210", up: true, icon: DollarSign, sub: "trailing 30 days" },
  { label: "Labor as % Revenue", value: "48.1%", delta: "-0.8%", up: true, icon: Activity, sub: "target ≤ 47%" },
  { label: "Fall Rate / 1k", value: "3.2", delta: "+0.4", up: false, icon: TrendingDown, sub: "above benchmark 2.8" },
  { label: "Family NPS", value: "67", delta: "+4", up: true, icon: Heart, sub: "Q2 survey" },
  { label: "Survey Readiness", value: "94/100", delta: "+2", up: true, icon: TrendingUp, sub: "est. window Sep–Dec" },
];

function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Analytics"
        description="Cross-module KPIs, trends, and benchmark comparisons."
        icon={BarChart3}
        color={MODULE_COLOR}
      />

      <div className="grid grid-cols-3 gap-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between text-muted-foreground mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon size={14} />
                  <span className="text-[10px] uppercase tracking-wider">{k.label}</span>
                </div>
                <span className={k.up ? "text-success text-xs font-mono" : "text-destructive text-xs font-mono"}>
                  {k.delta}
                </span>
              </div>
              <div className="text-2xl font-semibold tracking-tight">{k.value}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{k.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartPlaceholder title="Occupancy Trend (12 mo)" />
        <ChartPlaceholder title="Revenue vs Labor Cost" />
        <ChartPlaceholder title="Incident Rate by Category" />
        <ChartPlaceholder title="Family Engagement Index" />
      </div>
    </div>
  );
}

function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-sm font-medium mb-3">{title}</div>
      <div
        className="h-48 rounded-md grid place-items-center text-xs text-muted-foreground border border-dashed border-border"
        style={{ backgroundColor: `${MODULE_COLOR}08` }}
      >
        Chart placeholder
      </div>
    </div>
  );
}

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Haven OS" },
      { name: "description", content: "Cross-module KPIs, trends, and benchmarks." },
    ],
  }),
  component: AnalyticsPage,
});