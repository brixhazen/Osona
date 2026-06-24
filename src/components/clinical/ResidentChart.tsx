import { useState } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import {
  type Resident, type ResidentClinicalData, type VitalRecord, type NursingNote,
  type Incident, type CarePlanProblem, type AdlRecord, type MedOverride,
} from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";
import { OverviewTab } from "./tabs/OverviewTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { AssessmentsTab } from "./tabs/AssessmentsTab";
import { CarePlanTab } from "./tabs/CarePlanTab";
import { EMarTab } from "./tabs/EMarTab";
import { AdlTab } from "./tabs/AdlTab";
import { VitalsTab } from "./tabs/VitalsTab";
import { NotesTab } from "./tabs/NotesTab";
import { IncidentsTab } from "./tabs/IncidentsTab";
import { DocumentsTab } from "./tabs/DocumentsTab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Profile" },
  { id: "assessments", label: "Assessments" },
  { id: "care_plan", label: "Care Plan" },
  { id: "emar", label: "eMAR" },
  { id: "adl", label: "ADLs" },
  { id: "vitals", label: "Vitals" },
  { id: "notes", label: "Notes" },
  { id: "incidents", label: "Incidents" },
  { id: "documents", label: "Documents" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const CARE_LABELS = {
  memory_care: "Memory Care",
  assisted: "Assisted Living",
  independent: "Independent Living",
};

const CARE_COLORS = {
  memory_care: "bg-destructive/15 text-destructive border-destructive/25",
  assisted: "bg-primary/15 text-primary border-primary/25",
  independent: "bg-success/15 text-success border-success/25",
};

interface Props {
  resident: Resident;
  data: ResidentClinicalData;
  emarOverrides: Map<string, MedOverride>;
  onAddVital: (v: VitalRecord) => void;
  onAddNote: (n: NursingNote) => void;
  onAddIncident: (i: Incident) => void;
  onAddCarePlanProblem: (p: CarePlanProblem) => void;
  onResolveCarePlanProblem: (id: string) => void;
  onAddAdlRecord: (r: AdlRecord) => void;
  onSetEmarOverride: (key: string, override: MedOverride) => void;
}

export function ResidentChart({
  resident,
  data,
  emarOverrides,
  onAddVital,
  onAddNote,
  onAddIncident,
  onAddCarePlanProblem,
  onResolveCarePlanProblem,
  onAddAdlRecord,
  onSetEmarOverride,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const openIncidents = data.incidents.filter((i) => i.status !== "closed");
  const hasAlerts = openIncidents.length > 0 || resident.fallRisk === "high" || resident.elopementRisk === "high";

  const displayName = resident.preferredName
    ? `${resident.firstName} "${resident.preferredName}" ${resident.lastName}`
    : `${resident.firstName} ${resident.lastName}`;

  return (
    <div className="flex flex-col rounded-lg bg-card border border-border overflow-hidden">
      {/* Alert bar */}
      {hasAlerts && (
        <div className="bg-destructive/10 border-b border-destructive/25 px-5 py-2 flex items-center gap-4 flex-wrap">
          {openIncidents.map((inc) => (
            <span key={inc.id} className="inline-flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {inc.type === "fall" ? "Fall" : inc.type === "elopement" ? "Elopement attempt" : inc.type.replace("_", " ")} — {inc.date} {inc.time}
            </span>
          ))}
          {resident.elopementRisk === "high" && openIncidents.every((i) => i.type !== "elopement") && (
            <span className="inline-flex items-center gap-1.5 text-xs text-warning font-medium">
              <Shield className="w-3.5 h-3.5 shrink-0" /> HIGH elopement risk
            </span>
          )}
          {resident.fallRisk === "high" && openIncidents.every((i) => i.type !== "fall") && (
            <span className="inline-flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> HIGH fall risk
            </span>
          )}
        </div>
      )}

      {/* Resident header */}
      <div className="px-5 pt-4 pb-3 border-b border-border">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">{displayName}</h2>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
              <span className="font-mono">{resident.room}</span>
              <span className="text-border">·</span>
              <span>{resident.wing}</span>
              <span className="text-border">·</span>
              <span>{resident.age} yo {resident.gender}</span>
              <span className="text-border">·</span>
              <span>{resident.physician}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <span className={cn("text-[11px] px-2 py-0.5 rounded border font-medium", CARE_COLORS[resident.careLevel])}>
              {CARE_LABELS[resident.careLevel]}
            </span>
            <span className={cn(
              "text-[11px] px-2 py-0.5 rounded border font-medium",
              resident.dnr
                ? "bg-destructive/15 text-destructive border-destructive/25"
                : "bg-muted/40 text-muted-foreground border-border",
            )}>
              {resident.codeStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border overflow-x-auto">
        {TABS.map((tab) => {
          const incidentCount = tab.id === "incidents" ? openIncidents.length : 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors shrink-0 relative",
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {incidentCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                  {incidentCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {activeTab === "overview"    && <OverviewTab resident={resident} data={data} />}
        {activeTab === "profile"     && <ProfileTab resident={resident} data={data} />}
        {activeTab === "assessments" && <AssessmentsTab resident={resident} data={data} />}
        {activeTab === "care_plan"   && (
          <CarePlanTab
            resident={resident}
            data={data}
            onAddProblem={onAddCarePlanProblem}
            onResolveProblem={onResolveCarePlanProblem}
          />
        )}
        {activeTab === "emar" && (
          <EMarTab
            resident={resident}
            data={data}
            overrides={emarOverrides}
            onSetOverride={onSetEmarOverride}
          />
        )}
        {activeTab === "adl" && (
          <AdlTab
            resident={resident}
            data={data}
            onAddRecord={onAddAdlRecord}
          />
        )}
        {activeTab === "vitals" && (
          <VitalsTab
            resident={resident}
            data={data}
            onAddVital={onAddVital}
          />
        )}
        {activeTab === "notes" && (
          <NotesTab
            resident={resident}
            data={data}
            onAddNote={onAddNote}
          />
        )}
        {activeTab === "incidents" && (
          <IncidentsTab
            resident={resident}
            data={data}
            onAddIncident={onAddIncident}
          />
        )}
        {activeTab === "documents" && <DocumentsTab resident={resident} data={data} />}
      </div>
    </div>
  );
}
