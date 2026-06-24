import { useState } from "react";
import {
  RESIDENTS, CLINICAL_DATA,
  type ResidentClinicalData, type VitalRecord, type NursingNote,
  type Incident, type CarePlanProblem, type AdlRecord, type MedOverride,
} from "@/lib/mock/clinical";
import { syncClinicalIncidentAdded } from "@/lib/appStore";
import { ResidentRoster } from "./ResidentRoster";
import { ResidentChart } from "./ResidentChart";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { Stethoscope } from "lucide-react";

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

export function ClinicalModule() {
  const [selectedId, setSelectedId] = useState<string | null>(RESIDENTS[1].id);
  const [localData, setLocalData] = useState<Record<string, ResidentClinicalData>>(initData);
  const [emarOverrides, setEmarOverrides] = useState<Record<string, Map<string, MedOverride>>>({});

  const selected = RESIDENTS.find((r) => r.id === selectedId) ?? null;

  // ── Vitals ────────────────────────────────────────────────────────────────────

  function addVital(residentId: string, vital: VitalRecord) {
    setLocalData((prev) => ({
      ...prev,
      [residentId]: { ...prev[residentId], vitals: [...prev[residentId].vitals, vital] },
    }));
  }

  // ── Notes ─────────────────────────────────────────────────────────────────────

  function addNote(residentId: string, note: NursingNote) {
    setLocalData((prev) => ({
      ...prev,
      [residentId]: { ...prev[residentId], notes: [note, ...prev[residentId].notes] },
    }));
  }

  // ── Incidents ─────────────────────────────────────────────────────────────────

  function addIncident(residentId: string, incident: Incident) {
    setLocalData((prev) => {
      const next = {
        ...prev,
        [residentId]: { ...prev[residentId], incidents: [incident, ...prev[residentId].incidents] },
      };
      syncClinicalIncidentAdded(incident.stateReportable);
      return next;
    });
  }

  // ── Care Plan ─────────────────────────────────────────────────────────────────

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

  // ── ADLs ──────────────────────────────────────────────────────────────────────

  function addAdlRecord(residentId: string, record: AdlRecord) {
    setLocalData((prev) => ({
      ...prev,
      [residentId]: { ...prev[residentId], adlRecords: [record, ...prev[residentId].adlRecords] },
    }));
  }

  // ── eMAR overrides ────────────────────────────────────────────────────────────

  function setEmarOverride(residentId: string, key: string, override: MedOverride) {
    setEmarOverrides((prev) => {
      const map = new Map(prev[residentId] ?? new Map());
      map.set(key, override);
      return { ...prev, [residentId]: map };
    });
  }

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Clinical Records"
        description="Resident charts, care plans, assessments, and clinical documentation."
        icon={Stethoscope}
        color={MODULE_COLOR}
      />
      <div className="flex gap-5">
        <ResidentRoster selectedId={selectedId} onSelect={setSelectedId} />
        <div className="flex-1 min-w-0">
          {selected ? (
            <ResidentChart
              resident={selected}
              data={localData[selected.id]}
              emarOverrides={emarOverrides[selected.id] ?? new Map()}
              onAddVital={(v) => addVital(selected.id, v)}
              onAddNote={(n) => addNote(selected.id, n)}
              onAddIncident={(i) => addIncident(selected.id, i)}
              onAddCarePlanProblem={(p) => addCarePlanProblem(selected.id, p)}
              onResolveCarePlanProblem={(id) => resolveCarePlanProblem(selected.id, id)}
              onAddAdlRecord={(r) => addAdlRecord(selected.id, r)}
              onSetEmarOverride={(key, override) => setEmarOverride(selected.id, key, override)}
            />
          ) : (
            <div className="flex items-center justify-center h-64 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground">Select a resident to open their chart.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
