import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import {
  RESIDENTS, CLINICAL_DATA,
  type ResidentClinicalData, type CarePlanProblem,
} from "@/lib/mock/clinical";
import { ResidentRoster } from "@/components/clinical/ResidentRoster";
import { CarePlanTab } from "@/components/clinical/tabs/CarePlanTab";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

const MODULE_COLOR = "#2BBFAA";

function initData(): Record<string, ResidentClinicalData> {
  return Object.fromEntries(
    Object.entries(CLINICAL_DATA).map(([id, d]) => [
      id,
      {
        medications: d.medications.map((m) => ({ ...m, todayPasses: m.todayPasses.map((p) => ({ ...p })) })),
        vitals: [...d.vitals],
        carePlan: d.carePlan.map((p) => ({ ...p, interventions: [...p.interventions] })),
        assessments: [...d.assessments],
        adlRecords: d.adlRecords.map((r) => ({ ...r, adls: { ...r.adls } })),
        notes: [...d.notes],
        incidents: d.incidents.map((i) => ({ ...i })),
        documents: [...d.documents],
      },
    ]),
  );
}

function CarePlansPage() {
  const [selectedId, setSelectedId] = useState<string | null>(RESIDENTS[1].id);
  const [localData, setLocalData] = useState<Record<string, ResidentClinicalData>>(initData);
  const selected = RESIDENTS.find((r) => r.id === selectedId) ?? null;

  function addCarePlanProblem(residentId: string, problem: CarePlanProblem) {
    setLocalData((prev) => ({
      ...prev,
      [residentId]: { ...prev[residentId], carePlan: [problem, ...prev[residentId].carePlan] },
    }));
  }

  function resolveCarePlanProblem(residentId: string, problemId: string) {
    setLocalData((prev) => ({
      ...prev,
      [residentId]: {
        ...prev[residentId],
        carePlan: prev[residentId].carePlan.map((p) =>
          p.id === problemId ? { ...p, status: "resolved" as const } : p,
        ),
      },
    }));
  }

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Care Plans"
        description="Active problems, goals, and interventions per resident."
        icon={ClipboardList}
        color={MODULE_COLOR}
      />
      <div className="flex gap-5">
        <ResidentRoster selectedId={selectedId} onSelect={setSelectedId} />
        <div className="flex-1 min-w-0 rounded-lg bg-card border border-border p-5">
          {selected ? (
            <CarePlanTab
              resident={selected}
              data={localData[selected.id]}
              onAddProblem={(p) => addCarePlanProblem(selected.id, p)}
              onResolveProblem={(id) => resolveCarePlanProblem(selected.id, id)}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">Select a resident to view their care plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/care-plans")({
  head: () => ({
    meta: [
      { title: "Care Plans — Haven OS" },
      { name: "description", content: "Resident care plans, goals, and interventions." },
    ],
  }),
  component: CarePlansPage,
});