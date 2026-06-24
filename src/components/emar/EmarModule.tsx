import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pill, ClipboardList, BookOpen, AlertTriangle, Lock, BarChart3 } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import {
  EMAR_RESIDENTS, MEDICATIONS, AM_ADMINISTRATIONS, NOON_ADMINISTRATIONS,
  PRN_ADMINISTRATIONS, CONTROLLED_COUNTS, PASS_TIMES,
  type MedAdministration, type PrnAdministration, type ControlledCount,
  type PassTime,
} from "@/lib/mock/emar";
import { MedPass } from "./MedPass";
import { ResidentMAR } from "./ResidentMAR";
import { PrnLog } from "./PrnLog";
import { ControlledSubstances } from "./ControlledSubstances";
import { EmarReports } from "./EmarReports";

const MODULE_COLOR = "#8B5CF6";

type Tab = "pass" | "mar" | "prn" | "controlled" | "reports";

const TABS: { id: Tab; label: string; icon: typeof Pill }[] = [
  { id: "pass",       label: "Med Pass",              icon: Pill },
  { id: "mar",        label: "Resident MAR",          icon: BookOpen },
  { id: "prn",        label: "PRN Log",               icon: ClipboardList },
  { id: "controlled", label: "Controlled Substances", icon: Lock },
  { id: "reports",    label: "Reports",               icon: BarChart3 },
];

export function EmarModule() {
  const [tab, setTab] = useState<Tab>("pass");
  const [activePass, setActivePass] = useState<PassTime>("AM");

  const [administrations, setAdministrations] = useState<MedAdministration[]>([
    ...AM_ADMINISTRATIONS,
    ...NOON_ADMINISTRATIONS,
  ]);
  const [prnAdministrations, setPrnAdministrations] = useState<PrnAdministration[]>([...PRN_ADMINISTRATIONS]);
  const [controlledCounts, setControlledCounts] = useState<ControlledCount[]>([...CONTROLLED_COUNTS]);

  const today = new Date().toISOString().slice(0, 10);

  // KPI calculations
  const scheduledMedsForPass = MEDICATIONS.filter(
    (m) => m.active && !m.isPrn && m.scheduledPasses.includes(activePass),
  );
  const administeredForPass = administrations.filter(
    (a) => a.date === today && a.passTime === activePass,
  );
  const givenCount = administeredForPass.filter((a) => a.status === "given").length;
  const totalForPass = scheduledMedsForPass.length;
  const pctComplete = totalForPass > 0 ? Math.round((administeredForPass.length / totalForPass) * 100) : 0;

  const refusalsToday = administrations.filter((a) => a.date === today && a.status === "refused").length;
  const prnsToday = prnAdministrations.filter((a) => a.date === today).length;
  const countDiscrepancies = controlledCounts.filter((c) => c.actualCount !== c.expectedCount).length;

  function addAdministration(adm: MedAdministration) {
    setAdministrations((prev) => {
      const existing = prev.findIndex(
        (a) => a.medicationId === adm.medicationId && a.passTime === adm.passTime && a.date === adm.date,
      );
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = adm;
        return next;
      }
      return [...prev, adm];
    });
  }

  function addPrnAdministration(prn: PrnAdministration) {
    setPrnAdministrations((prev) => [...prev, prn]);
  }

  function updatePrnAdministration(id: string, updates: Partial<PrnAdministration>) {
    setPrnAdministrations((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));
  }

  function addControlledCount(count: ControlledCount) {
    setControlledCounts((prev) => [...prev, count]);
  }

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="eMAR"
        description="Electronic medication administration record — med pass, PRN log, and controlled substance tracking."
        icon={Pill}
        color={MODULE_COLOR}
      />

      {/* KPI bar */}
      <div className="grid grid-cols-5 gap-3">
        <KpiCard
          icon={<Pill size={14} />}
          label={`${activePass} Pass Progress`}
          value={`${administeredForPass.length} / ${totalForPass}`}
          sub={`${pctComplete}% documented`}
          tone={pctComplete === 100 ? "ok" : pctComplete >= 50 ? undefined : "warn"}
        />
        <KpiCard
          icon={<Pill size={14} />}
          label="Given This Pass"
          value={String(givenCount)}
          sub={`${totalForPass - administeredForPass.length} remaining`}
          tone="ok"
        />
        <KpiCard
          icon={<AlertTriangle size={14} />}
          label="Refusals Today"
          value={String(refusalsToday)}
          sub={refusalsToday > 0 ? "Physician to be notified" : "None recorded"}
          tone={refusalsToday > 0 ? "warn" : undefined}
        />
        <KpiCard
          icon={<ClipboardList size={14} />}
          label="PRNs Given Today"
          value={String(prnsToday)}
          sub="As-needed administrations"
        />
        <KpiCard
          icon={<Lock size={14} />}
          label="Controlled Count"
          value={countDiscrepancies > 0 ? `${countDiscrepancies} Discrepanc${countDiscrepancies > 1 ? "ies" : "y"}` : "All Clear"}
          sub={countDiscrepancies > 0 ? "DON notification required" : "Counts verified"}
          tone={countDiscrepancies > 0 ? "danger" : undefined}
        />
      </div>

      {/* Refusal alert bar */}
      {refusalsToday > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <AlertTriangle size={14} className="text-destructive shrink-0" />
          <span className="text-sm">
            <span className="text-destructive font-medium">{refusalsToday} medication refusal{refusalsToday > 1 ? "s" : ""} recorded today</span>
            <span className="text-muted-foreground"> — physician notification required per policy</span>
          </span>
          <button
            onClick={() => setTab("pass")}
            className="ml-auto text-xs text-destructive hover:text-destructive/80 font-medium"
          >
            View Pass →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-b-2" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            style={tab === t.id ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
          >
            <t.icon size={13} />
            {t.label}
            {t.id === "controlled" && countDiscrepancies > 0 && (
              <span className="ml-1 text-[10px] bg-destructive/10 text-destructive px-1 py-0.5 rounded font-mono">
                {countDiscrepancies}
              </span>
            )}
            {t.id === "prn" && prnsToday > 0 && (
              <span className="ml-1 text-[10px] bg-primary/10 px-1 py-0.5 rounded font-mono" style={{ color: MODULE_COLOR }}>
                {prnsToday}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "pass" && (
        <MedPass
          residents={EMAR_RESIDENTS}
          medications={MEDICATIONS}
          administrations={administrations}
          activePass={activePass}
          onChangePass={setActivePass}
          onAddAdministration={addAdministration}
        />
      )}
      {tab === "mar" && (
        <ResidentMAR
          residents={EMAR_RESIDENTS}
          medications={MEDICATIONS}
          administrations={administrations}
        />
      )}
      {tab === "prn" && (
        <PrnLog
          residents={EMAR_RESIDENTS}
          medications={MEDICATIONS}
          prnAdministrations={prnAdministrations}
          onAddPrn={addPrnAdministration}
          onUpdatePrn={updatePrnAdministration}
        />
      )}
      {tab === "controlled" && (
        <ControlledSubstances
          residents={EMAR_RESIDENTS}
          medications={MEDICATIONS}
          administrations={administrations}
          counts={controlledCounts}
          onAddCount={addControlledCount}
        />
      )}
      {tab === "reports" && (
        <EmarReports
          residents={EMAR_RESIDENTS}
          medications={MEDICATIONS}
          administrations={administrations}
          prnAdministrations={prnAdministrations}
        />
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, tone }: {
  icon: React.ReactNode; label: string; value: string; sub: string; tone?: "ok" | "warn" | "danger";
}) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4",
      tone === "danger" ? "border-destructive/30" : tone === "warn" ? "border-accent/30" : "border-border",
    )}>
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn(
        "text-lg font-semibold leading-tight",
        tone === "danger" ? "text-destructive" : tone === "warn" ? "text-accent" : tone === "ok" ? "text-success" : "text-foreground",
      )}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
