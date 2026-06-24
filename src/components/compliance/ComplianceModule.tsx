import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ComplianceOverview } from "./ComplianceOverview";
import { IncidentLog } from "./IncidentLog";
import { SurveyPrep } from "./SurveyPrep";
import { QapiDashboard } from "./QapiDashboard";
import { RegulatoryCalendar } from "./RegulatoryCalendar";
import {
  INCIDENTS, READINESS_DOMAINS, QAPI_INDICATORS, ACTIVE_PIPS, REGULATORY_EVENTS,
  INCIDENT_WORKFLOW, WORKFLOW_ORDER, LAST_SURVEY_DATE, daysSince, CREDENTIAL_COMPLIANCE_PCT,
  type Incident, type IncidentStatus, type ReadinessDomain, type ReadinessDomainGroup,
} from "@/lib/mock/compliance";
import { AlertTriangle, ShieldCheck, ClipboardList, BarChart3, FileWarning } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { syncComplianceIncidents, syncComplianceQapi, syncComplianceSurvey } from "@/lib/appStore";

const MODULE_COLOR = "#60A5FA";

type Tab = "overview" | "incidents" | "survey" | "qapi" | "calendar";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview" },
  { id: "incidents", label: "Incidents" },
  { id: "survey",    label: "Survey Prep" },
  { id: "qapi",      label: "QAPI" },
  { id: "calendar",  label: "Regulatory Calendar" },
];

function getNextStatus(inc: Incident): IncidentStatus | null {
  const steps: IncidentStatus[] = inc.stateReportable
    ? ["reported", "investigating", "awaiting_family", "state_reported", "care_plan_updated", "closed"]
    : ["reported", "investigating", "awaiting_family", "care_plan_updated", "closed"];
  const idx = steps.indexOf(inc.status);
  if (idx < 0 || idx >= steps.length - 1) return null;
  return steps[idx + 1];
}

export function ComplianceModule() {
  const [tab, setTab] = useState<Tab>("overview");

  const [localIncidents, setLocalIncidents] = useState<Incident[]>([...INCIDENTS]);
  const [localDomains, setLocalDomains] = useState<ReadinessDomainGroup[]>(
    READINESS_DOMAINS.map((d) => ({ ...d, items: d.items.map((i) => ({ ...i })) })),
  );
  const [localIndicators, setLocalIndicators] = useState([...QAPI_INDICATORS]);
  const [localPips, setLocalPips] = useState(
    ACTIVE_PIPS.map((p) => ({ ...p, interventions: p.interventions.map((iv) => ({ ...iv })) })),
  );
  const [localEvents, setLocalEvents] = useState([...REGULATORY_EVENTS]);
  const [localCompletedEvents, setLocalCompletedEvents] = useState<Set<string>>(new Set());

  const liveOpenIncidents = useMemo(
    () => localIncidents.filter((i) => i.status !== "closed"),
    [localIncidents],
  );
  const liveStatePending = useMemo(
    () => localIncidents.filter((i) => i.stateReportable && !i.stateReportedDate && i.status !== "closed"),
    [localIncidents],
  );
  const liveQapiAlerts = useMemo(
    () => localIndicators.filter((q) => q.inAlert).length,
    [localIndicators],
  );
  const liveReadinessScore = useMemo(() => {
    const allItems = localDomains.flatMap((d) => d.items);
    const total = allItems.reduce(
      (s, i) => s + (i.status === "complete" ? 100 : i.status === "needs_attention" ? 60 : 0),
      0,
    );
    return Math.round(total / allItems.length);
  }, [localDomains]);

  // ── Incident mutations ─────────────────────────────────────────────────────

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

  // ── Survey mutations ───────────────────────────────────────────────────────

  function cycleItemStatus(domain: ReadinessDomain, itemId: string) {
    setLocalDomains((prev) => {
      const next = prev.map((d) => {
        if (d.domain !== domain) return d;
        const newItems = d.items.map((item) => {
          if (item.id !== itemId) return item;
          const nextStatus =
            item.status === "missing"
              ? ("needs_attention" as const)
              : item.status === "needs_attention"
                ? ("complete" as const)
                : ("needs_attention" as const);
          return { ...item, status: nextStatus };
        });
        const score = Math.round(
          newItems.reduce(
            (s, i) => s + (i.status === "complete" ? 100 : i.status === "needs_attention" ? 60 : 0),
            0,
          ) / newItems.length,
        );
        return { ...d, items: newItems, score };
      });
      const allItems = next.flatMap((d) => d.items);
      syncComplianceSurvey(
        Math.round(
          allItems.reduce(
            (s, i) => s + (i.status === "complete" ? 100 : i.status === "needs_attention" ? 60 : 0),
            0,
          ) / allItems.length,
        ),
      );
      return next;
    });
  }

  // ── QAPI mutations ─────────────────────────────────────────────────────────

  function updateIndicatorValue(indicatorId: string, value: number) {
    setLocalIndicators((prev) => {
      const next = prev.map((q) => {
        if (q.id !== indicatorId) return q;
        const newHistory = [...q.history.slice(1), { month: "Jun", value }];
        const inAlert = value > q.benchmark;
        return { ...q, value, history: newHistory, inAlert };
      });
      syncComplianceQapi(next.filter((q) => q.inAlert).length);
      return next;
    });
  }

  function togglePipIntervention(pipId: string, index: number) {
    setLocalPips((prev) =>
      prev.map((pip) => {
        if (pip.id !== pipId) return pip;
        const interventions = pip.interventions.map((iv, i) =>
          i === index ? { ...iv, completed: !iv.completed } : iv,
        );
        return { ...pip, interventions };
      }),
    );
  }

  // ── Calendar mutations ─────────────────────────────────────────────────────

  function toggleEventComplete(eventId: string) {
    setLocalCompletedEvents((prev) => {
      const next = new Set(prev);
      next.has(eventId) ? next.delete(eventId) : next.add(eventId);
      return next;
    });
  }

  function updateEventNote(eventId: string, note: string) {
    setLocalEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, notes: note } : ev)),
    );
  }

  const urgentPendingReport = liveStatePending
    .filter((i) => i.stateReportDeadline)
    .sort((a, b) => (a.stateReportDeadline ?? "").localeCompare(b.stateReportDeadline ?? ""))[0];

  const urgentOverdueDays = urgentPendingReport?.stateReportDeadline
    ? daysSince(urgentPendingReport.stateReportDeadline)
    : 0;

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Compliance & Survey Readiness"
        description="Survey prep, incident tracking, QAPI, and regulatory calendar."
        icon={ShieldCheck}
        color={MODULE_COLOR}
      />

      {/* KPI bar */}
      <div className="grid grid-cols-5 gap-3">
        <KpiCard
          icon={<ShieldCheck size={14} />}
          label="Survey Readiness"
          value={`${liveReadinessScore}/100`}
          sub="Est. next survey Sep–Dec 2026"
          tone={liveReadinessScore >= 90 ? "ok" : "warn"}
        />
        <KpiCard
          icon={<AlertTriangle size={14} />}
          label="Open Incidents"
          value={`${liveOpenIncidents.length} open`}
          sub={liveStatePending.length > 0 ? `${liveStatePending.length} state report pending` : "no urgent reports"}
          tone={liveStatePending.length > 0 ? "danger" : liveOpenIncidents.length > 0 ? "warn" : undefined}
        />
        <KpiCard
          icon={<ClipboardList size={14} />}
          label="Last Survey"
          value={`${daysSince(LAST_SURVEY_DATE)} days ago`}
          sub="March 12, 2026 · 0 active deficiencies"
        />
        <KpiCard
          icon={<FileWarning size={14} />}
          label="Credential Compliance"
          value={`${CREDENTIAL_COMPLIANCE_PCT}%`}
          sub="Carol Nguyen CNA expired"
          tone="warn"
        />
        <KpiCard
          icon={<BarChart3 size={14} />}
          label="QAPI Alerts"
          value={`${liveQapiAlerts} of 5 indicators`}
          sub="Fall rate above benchmark"
          tone={liveQapiAlerts > 0 ? "warn" : "ok"}
        />
      </div>

      {/* Urgent alert bar */}
      {liveStatePending.length > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <AlertTriangle size={14} className="text-destructive shrink-0" />
          <span className="text-sm">
            <span className="text-destructive font-medium">
              {liveStatePending.length} state-reportable incident{liveStatePending.length !== 1 ? "s" : ""} pending submission
            </span>
            {urgentPendingReport && (
              <>
                <span className="text-muted-foreground"> · {urgentPendingReport.residentName} report</span>
                <span className="text-destructive font-medium ml-1">
                  {urgentOverdueDays > 0
                    ? `${urgentOverdueDays} day${urgentOverdueDays !== 1 ? "s" : ""} overdue`
                    : `due ${urgentPendingReport.stateReportDeadline}`}
                </span>
              </>
            )}
          </span>
          <button
            onClick={() => setTab("incidents")}
            className="ml-auto text-xs text-destructive hover:text-destructive/80 font-medium"
          >
            View Incidents →
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
              "px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-b-2"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            style={tab === t.id ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
          >
            {t.label}
            {t.id === "incidents" && liveOpenIncidents.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-destructive/10 text-destructive px-1 py-0.5 rounded font-mono">
                {liveOpenIncidents.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <ComplianceOverview
          liveScore={liveReadinessScore}
          domains={localDomains}
          openIncidents={liveOpenIncidents}
          events={localEvents}
          completedEvents={localCompletedEvents}
          onNavigate={setTab}
        />
      )}
      {tab === "incidents" && (
        <IncidentLog
          incidents={localIncidents}
          onAdvanceWorkflow={advanceWorkflow}
          onMarkNotified={markNotified}
          onFileStateReport={fileStateReport}
          onToggleCorrectiveAction={toggleCorrectiveAction}
          onAddIncident={addIncident}
        />
      )}
      {tab === "survey" && (
        <SurveyPrep
          domains={localDomains}
          liveScore={liveReadinessScore}
          onCycleItemStatus={cycleItemStatus}
        />
      )}
      {tab === "qapi" && (
        <QapiDashboard
          indicators={localIndicators}
          pips={localPips}
          onUpdateIndicatorValue={updateIndicatorValue}
          onTogglePipIntervention={togglePipIntervention}
        />
      )}
      {tab === "calendar" && (
        <RegulatoryCalendar
          events={localEvents}
          completedEvents={localCompletedEvents}
          onToggleComplete={toggleEventComplete}
          onUpdateEventNote={updateEventNote}
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
