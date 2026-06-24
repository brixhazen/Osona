import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { IncidentLog } from "@/components/compliance/IncidentLog";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import {
  INCIDENTS,
  type Incident, type IncidentStatus,
} from "@/lib/mock/compliance";
import { syncComplianceIncidents } from "@/lib/appStore";

const MODULE_COLOR = "#60A5FA";

function getNextStatus(inc: Incident): IncidentStatus | null {
  const steps: IncidentStatus[] = inc.stateReportable
    ? ["reported", "investigating", "awaiting_family", "state_reported", "care_plan_updated", "closed"]
    : ["reported", "investigating", "awaiting_family", "care_plan_updated", "closed"];
  const idx = steps.indexOf(inc.status);
  if (idx < 0 || idx >= steps.length - 1) return null;
  return steps[idx + 1];
}

function SafetyPage() {
  const [localIncidents, setLocalIncidents] = useState<Incident[]>([...INCIDENTS]);

  const openCount = useMemo(() => localIncidents.filter((i) => i.status !== "closed").length, [localIncidents]);
  const pendingCount = useMemo(
    () => localIncidents.filter((i) => i.stateReportable && !i.stateReportedDate && i.status !== "closed").length,
    [localIncidents],
  );

  function advanceWorkflow(incidentId: string) {
    setLocalIncidents((prev) => {
      const next = prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        if (inc.stateReportable && inc.status === "awaiting_family" && !inc.stateReportedDate) return inc;
        const nextStatus = getNextStatus(inc);
        if (!nextStatus) return inc;
        const updates: Partial<Incident> = { status: nextStatus };
        if (nextStatus === "closed") {
          updates.closedDate = new Date().toISOString().slice(0, 10);
          updates.closedBy = "Haven Command Center";
        }
        return { ...inc, ...updates };
      });
      syncComplianceIncidents(
        next.filter((i) => i.status !== "closed").length,
        next.filter((i) => i.stateReportable && !i.stateReportedDate && i.status !== "closed").length,
      );
      return next;
    });
  }

  function markNotified(incidentId: string, type: "family" | "physician") {
    setLocalIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        if (type === "family") return { ...inc, familyNotified: true, familyNotifiedDate: new Date().toISOString().slice(0, 10) };
        return { ...inc, physicianNotified: true };
      }),
    );
  }

  function fileStateReport(incidentId: string) {
    setLocalIncidents((prev) => {
      const next = prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return { ...inc, stateReportedDate: new Date().toISOString().slice(0, 10), status: "state_reported" as IncidentStatus };
      });
      syncComplianceIncidents(
        next.filter((i) => i.status !== "closed").length,
        next.filter((i) => i.stateReportable && !i.stateReportedDate && i.status !== "closed").length,
      );
      return next;
    });
  }

  function toggleCorrectiveAction(incidentId: string, index: number) {
    setLocalIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const actions = inc.correctiveActions.map((a, i) =>
          i === index ? { ...a, completed: !a.completed } : a,
        );
        return { ...inc, correctiveActions: actions };
      }),
    );
  }

  function addIncident(inc: Omit<Incident, "id">) {
    const id = `inc${String(localIncidents.length + 1).padStart(3, "0")}`;
    setLocalIncidents((prev) => {
      const next = [{ ...inc, id }, ...prev];
      syncComplianceIncidents(
        next.filter((i) => i.status !== "closed").length,
        next.filter((i) => i.stateReportable && !i.stateReportedDate && i.status !== "closed").length,
      );
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Safety & Incidents"
        description="Incident log, investigation workflow, and state reporting."
        icon={AlertTriangle}
        color={MODULE_COLOR}
      />
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <AlertTriangle size={14} className="text-destructive shrink-0" />
          <span className="text-sm text-destructive font-medium">
            {pendingCount} state-reportable incident{pendingCount !== 1 ? "s" : ""} pending submission · {openCount} open total
          </span>
        </div>
      )}
      <IncidentLog
        incidents={localIncidents}
        onAdvanceWorkflow={advanceWorkflow}
        onMarkNotified={markNotified}
        onFileStateReport={fileStateReport}
        onToggleCorrectiveAction={toggleCorrectiveAction}
        onAddIncident={addIncident}
      />
    </div>
  );
}

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety — Haven OS" },
      { name: "description", content: "Incident reporting and investigation workflow." },
    ],
  }),
  component: SafetyPage,
});