import { useState } from "react";
import { FileCheck2 } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { cn } from "@/lib/utils";
import { ADMISSION_PACKETS } from "@/lib/mock/admissions";
import { PacketDashboard } from "./PacketDashboard";
import { DocumentLibrary } from "./DocumentLibrary";

const MODULE_COLOR = "#10B981";

type Tab = "packets" | "library";

const TABS: { id: Tab; label: string }[] = [
  { id: "packets", label: "Admission Packets" },
  { id: "library", label: "Document Library" },
];

export function AdmissionsModule() {
  const [tab, setTab] = useState<Tab>("packets");

  const complete    = ADMISSION_PACKETS.filter((p) => p.status === "complete").length;
  const inProgress  = ADMISSION_PACKETS.filter((p) => p.status === "in_progress").length;
  const awaiting    = ADMISSION_PACKETS.filter((p) => p.status === "sent").length;
  const total       = ADMISSION_PACKETS.length;

  return (
    <div className="space-y-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Admissions"
        description="Digital move-in packets, e-signatures, and resident onboarding."
        icon={FileCheck2}
        color={MODULE_COLOR}
      />

      {/* KPI bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Packets",       value: total,      sub: "all time" },
          { label: "Complete This Month", value: complete,   sub: "signed & archived", highlight: true },
          { label: "In Progress",         value: inProgress, sub: "partially signed" },
          { label: "Awaiting Signature",  value: awaiting,   sub: "sent, not started" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border px-4 py-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{kpi.label}</div>
            <div
              className="text-2xl font-bold font-mono"
              style={{ color: kpi.highlight ? MODULE_COLOR : undefined }}
            >
              {kpi.value}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id ? "" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            style={tab === t.id ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "packets" && <PacketDashboard />}
      {tab === "library" && <DocumentLibrary />}
    </div>
  );
}
