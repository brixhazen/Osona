import { createFileRoute } from "@tanstack/react-router";
import { KpiRow } from "@/components/dashboard/KpiRow";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { CensusTable } from "@/components/dashboard/CensusTable";
import { OperationsBriefing } from "@/components/dashboard/OperationsBriefing";
import { ClinicalFlags } from "@/components/dashboard/ClinicalFlags";
import { WorkforceSnapshot } from "@/components/dashboard/WorkforceSnapshot";
import { SalesFunnel } from "@/components/dashboard/SalesFunnel";
import { ArAging } from "@/components/dashboard/ArAging";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Analytics — Haven OS" },
      { name: "description", content: "Executive dashboard: occupancy, revenue, staffing, and clinical quality at a glance." },
    ],
  }),
  component: AnalyticsDashboard,
});

function AnalyticsDashboard() {
  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <header>
        <h1 className="font-display text-xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-xs text-muted-foreground">Real-time view across census, revenue, workforce, and clinical quality.</p>
      </header>

      <KpiRow />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 space-y-5">
          <OccupancyChart />
          <CensusTable />
        </div>
        <div className="xl:col-span-2 space-y-5">
          <OperationsBriefing />
          <ClinicalFlags />
          <WorkforceSnapshot />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SalesFunnel />
        <ArAging />
      </div>
    </div>
  );
}
