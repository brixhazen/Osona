import { useState } from "react";
import {
  INCIDENT_TYPE_CONFIG, SEVERITY_CONFIG, WORKFLOW_ORDER,
  INCIDENT_WORKFLOW, type Incident, type IncidentType, type IncidentStatus, type IncidentSeverity,
} from "@/lib/mock/compliance";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, ChevronRight, Clock, Download, FileText,
  MapPin, Stethoscope, ClipboardList, Plus, Users,
} from "lucide-react";

interface Props {
  incidents: Incident[];
  onAdvanceWorkflow: (id: string) => void;
  onMarkNotified: (id: string, type: "family" | "physician") => void;
  onFileStateReport: (id: string) => void;
  onToggleCorrectiveAction: (id: string, index: number) => void;
  onAddIncident: (inc: Omit<Incident, "id">) => void;
}

type IncidentFilter = "all" | "open" | "state_reportable" | "closed";

const TYPE_FILTER_OPTIONS: (IncidentType | "all")[] = [
  "all", "fall", "medication_error", "elopement", "altercation", "injury_unknown",
];

const WORKFLOW_LABELS: Record<IncidentStatus, string> = {
  reported:          "Reported",
  investigating:     "Investigated",
  awaiting_family:   "Family Notified",
  state_reported:    "State Reported",
  care_plan_updated: "Care Plan Updated",
  closed:            "Closed",
};

function downloadIncidentsCSV(incidents: Incident[]) {
  const header = ["ID", "Type", "Resident", "Room", "Date", "Severity", "Status", "State Reportable", "Report Deadline", "Reported By"];
  const rows = incidents.map((i) => [
    i.id,
    INCIDENT_TYPE_CONFIG[i.type].label,
    i.residentName,
    i.residentRoom,
    i.date,
    i.severity,
    i.status.replace(/_/g, " "),
    i.stateReportable ? "Yes" : "No",
    i.stateReportDeadline ?? "",
    i.reportedBy,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = "incidents.csv"; a.click();
  URL.revokeObjectURL(url);
}

function getNextStatus(inc: Incident): IncidentStatus | null {
  const steps: IncidentStatus[] = inc.stateReportable
    ? ["reported", "investigating", "awaiting_family", "state_reported", "care_plan_updated", "closed"]
    : ["reported", "investigating", "awaiting_family", "care_plan_updated", "closed"];
  const idx = steps.indexOf(inc.status);
  if (idx < 0 || idx >= steps.length - 1) return null;
  return steps[idx + 1];
}

export function IncidentLog({
  incidents,
  onAdvanceWorkflow,
  onMarkNotified,
  onFileStateReport,
  onToggleCorrectiveAction,
  onAddIncident,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<IncidentFilter>("all");
  const [typeFilter, setTypeFilter] = useState<IncidentType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLogForm, setShowLogForm] = useState(false);

  const selectedIncident = incidents.find((i) => i.id === selectedId) ?? null;

  const STATUS_FILTERS: { id: IncidentFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "open", label: "Open" },
    { id: "state_reportable", label: "State Reportable" },
    { id: "closed", label: "Closed" },
  ];

  const filtered = incidents.filter((inc) => {
    const matchStatus =
      statusFilter === "all" ? true
      : statusFilter === "open" ? inc.status !== "closed"
      : statusFilter === "state_reportable" ? inc.stateReportable
      : inc.status === "closed";
    const matchType = typeFilter === "all" || inc.type === typeFilter;
    return matchStatus && matchType;
  }).sort((a, b) => {
    if (a.status !== "closed" && b.status === "closed") return -1;
    if (a.status === "closed" && b.status !== "closed") return 1;
    return b.date.localeCompare(a.date);
  });

  return (
    <>
      {/* Filters + log button */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const count = incidents.filter((i) =>
              f.id === "all" ? true
              : f.id === "open" ? i.status !== "closed"
              : f.id === "state_reportable" ? i.stateReportable
              : i.status === "closed",
            ).length;
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                  statusFilter === f.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
                <span className="ml-1.5 font-mono opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-border" />

        {TYPE_FILTER_OPTIONS.map((t) => {
          const cfg = t !== "all" ? INCIDENT_TYPE_CONFIG[t] : null;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "h-6 px-2.5 rounded-full text-[10px] font-medium border transition-colors",
                typeFilter === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "all" ? "All Types" : cfg!.label}
            </button>
          );
        })}

        <button
          onClick={() => downloadIncidentsCSV(incidents)}
          className="ml-auto flex items-center gap-1.5 h-7 px-3 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download size={11} />
          Export CSV
        </button>
        <button
          onClick={() => setShowLogForm(true)}
          className="flex items-center gap-1.5 h-7 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={11} />
          Log Incident
        </button>
      </div>

      {/* Incident list */}
      <div className="flex flex-col gap-2">
        {filtered.map((inc) => (
          <IncidentCard key={inc.id} incident={inc} onClick={() => setSelectedId(inc.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No incidents match the current filters.
          </div>
        )}
      </div>

      {/* Detail sheet */}
      <Sheet open={selectedId !== null} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-[540px] sm:max-w-2xl bg-card border-l border-border overflow-y-auto">
          {selectedIncident && (
            <IncidentDetail
              incident={selectedIncident}
              onAdvanceWorkflow={() => onAdvanceWorkflow(selectedIncident.id)}
              onMarkFamily={() => onMarkNotified(selectedIncident.id, "family")}
              onMarkPhysician={() => onMarkNotified(selectedIncident.id, "physician")}
              onFileStateReport={() => onFileStateReport(selectedIncident.id)}
              onToggleAction={(index) => onToggleCorrectiveAction(selectedIncident.id, index)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Log incident form sheet */}
      <Sheet open={showLogForm} onOpenChange={(o) => !o && setShowLogForm(false)}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <LogIncidentForm onSubmit={onAddIncident} onClose={() => setShowLogForm(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function IncidentCard({ incident: inc, onClick }: { incident: Incident; onClick: () => void }) {
  const typeCfg = INCIDENT_TYPE_CONFIG[inc.type];
  const sevCfg = SEVERITY_CONFIG[inc.severity];
  const isClosed = inc.status === "closed";
  const isUrgent = inc.stateReportable && !inc.stateReportedDate && !isClosed;
  const step = WORKFLOW_ORDER[inc.status];

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-4 text-left hover:border-primary/30 transition-colors",
        isUrgent ? "border-destructive/40" : "border-border",
        isClosed && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "size-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
          inc.severity === 3 ? "bg-destructive/15 text-destructive"
          : inc.severity === 2 ? "bg-accent/15 text-accent"
          : "bg-success/15 text-success",
        )}>
          S{inc.severity}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <div className="text-sm font-medium">{inc.residentName}</div>
              <div className="text-[11px] text-muted-foreground">{inc.residentRoom} · {inc.date} at {inc.time}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", sevCfg.cls)}>
                {sevCfg.label}
              </span>
              <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", typeCfg.color)}>
                {typeCfg.label}
              </span>
            </div>
          </div>

          {isUrgent && (
            <div className="flex items-center gap-1.5 mb-2 text-[10px] text-destructive font-medium">
              <AlertTriangle size={10} />
              State report required · Due {inc.stateReportDeadline}
            </div>
          )}
          {inc.stateReportable && inc.stateReportedDate && (
            <div className="flex items-center gap-1.5 mb-2 text-[10px] text-success">
              <CheckCircle size={10} />
              State report submitted {inc.stateReportedDate}
            </div>
          )}

          <div className="text-[11px] text-muted-foreground line-clamp-2 mb-2">
            {inc.description}
          </div>

          <div className="flex items-center gap-1">
            {INCIDENT_WORKFLOW.filter((w) => inc.stateReportable || w.key !== "state_reported").map((w) => {
              const wStep = WORKFLOW_ORDER[w.key];
              const isDone = step > wStep;
              const isActive = step === wStep;
              return (
                <div key={w.key} className="flex items-center gap-1 flex-1">
                  <div className="flex-1">
                    <div className={cn(
                      "h-1.5 rounded-full",
                      isDone ? "bg-primary" : isActive ? "bg-accent" : "bg-muted",
                    )} />
                    <div className={cn(
                      "text-[8px] mt-0.5 truncate",
                      isDone ? "text-primary" : isActive ? "text-accent" : "text-muted-foreground",
                    )}>
                      {w.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
            <span>{inc.reportedBy.split(",")[0]}</span>
            <span>·</span>
            <span>{inc.location}</span>
            {inc.closedDate && <span>· Closed {inc.closedDate}</span>}
          </div>
        </div>

        <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-1" />
      </div>
    </button>
  );
}

function IncidentDetail({
  incident: inc,
  onAdvanceWorkflow,
  onMarkFamily,
  onMarkPhysician,
  onFileStateReport,
  onToggleAction,
}: {
  incident: Incident;
  onAdvanceWorkflow: () => void;
  onMarkFamily: () => void;
  onMarkPhysician: () => void;
  onFileStateReport: () => void;
  onToggleAction: (index: number) => void;
}) {
  const typeCfg = INCIDENT_TYPE_CONFIG[inc.type];
  const sevCfg = SEVERITY_CONFIG[inc.severity];
  const step = WORKFLOW_ORDER[inc.status];
  const workflowSteps = INCIDENT_WORKFLOW.filter((w) => inc.stateReportable || w.key !== "state_reported");
  const nextStep = getNextStatus(inc);
  const isBlockedByStateReport = inc.stateReportable && inc.status === "awaiting_family" && !inc.stateReportedDate;
  const canAdvance = inc.status !== "closed" && nextStep !== null && !isBlockedByStateReport;

  return (
    <>
      <SheetHeader className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", typeCfg.color)}>
            {typeCfg.label}
          </span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", sevCfg.cls)}>
            {sevCfg.label}
          </span>
        </div>
        <SheetTitle>{inc.residentName} — {inc.residentRoom}</SheetTitle>
        <SheetDescription>{inc.date} at {inc.time} · Reported by {inc.reportedBy}</SheetDescription>
      </SheetHeader>

      <div className="space-y-5">
        {/* State report alert */}
        {inc.stateReportable && !inc.stateReportedDate && inc.status !== "closed" && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-destructive text-xs font-medium mb-0.5">
              <AlertTriangle size={11} />
              State Report Required
            </div>
            <div className="text-[11px] text-destructive/80">
              Submit Form AL-1400 by <span className="font-semibold">{inc.stateReportDeadline}</span>. Failure to report on time may result in regulatory action.
            </div>
          </div>
        )}
        {inc.stateReportable && inc.stateReportedDate && (
          <div className="rounded-md border border-success/30 bg-success/5 px-3 py-2 flex items-center gap-2 text-[11px] text-success">
            <CheckCircle size={11} />
            State report submitted {inc.stateReportedDate}
          </div>
        )}

        {/* Workflow progress */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Incident Workflow</div>
          <div className="flex items-start gap-2">
            {workflowSteps.map((w, i) => {
              const wStep = WORKFLOW_ORDER[w.key];
              const isDone = step > wStep;
              const isActive = step === wStep;
              return (
                <div key={w.key} className="flex-1 flex flex-col items-center gap-1">
                  <div className={cn(
                    "size-6 rounded-full border-2 flex items-center justify-center text-[9px] font-bold",
                    isDone ? "border-primary bg-primary text-primary-foreground"
                    : isActive ? "border-accent bg-accent/15 text-accent"
                    : "border-muted bg-muted/30 text-muted-foreground",
                  )}>
                    {isDone ? <CheckCircle size={10} /> : i + 1}
                  </div>
                  <div className={cn(
                    "text-[8px] text-center leading-tight",
                    isDone ? "text-primary" : isActive ? "text-accent" : "text-muted-foreground",
                  )}>
                    {w.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <DetailSection icon={<FileText size={12} />} label="Incident Description">
          <p className="text-[11px] text-foreground/80 leading-relaxed">{inc.description}</p>
        </DetailSection>

        {/* Injuries */}
        <DetailSection icon={<Stethoscope size={12} />} label="Injuries / Medical Assessment">
          <p className="text-[11px] text-foreground/80 leading-relaxed">{inc.injuries || "None documented"}</p>
        </DetailSection>

        {/* Location + witnesses */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-secondary/30 p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
              <MapPin size={9} /> Location
            </div>
            <div className="text-xs">{inc.location}</div>
          </div>
          <div className="rounded-md border border-border bg-secondary/30 p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
              <Users size={9} /> Witnesses
            </div>
            <div className="text-xs">
              {inc.witnesses.length === 0 ? "None documented" : inc.witnesses.join(", ")}
            </div>
          </div>
        </div>

        {/* Immediate actions */}
        {inc.immediateActions && (
          <DetailSection icon={<ClipboardList size={12} />} label="Immediate Actions Taken">
            <p className="text-[11px] text-foreground/80 leading-relaxed">{inc.immediateActions}</p>
          </DetailSection>
        )}

        {/* Notifications */}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Notifications</div>
          <div className="flex flex-col gap-1.5">
            <NotifRow
              label="Physician Notified"
              done={inc.physicianNotified}
              sub={inc.physicianNotified ? "Notified at time of incident" : "Pending"}
              action={!inc.physicianNotified && inc.status !== "closed" ? onMarkPhysician : undefined}
              actionLabel="Mark Notified"
            />
            <NotifRow
              label="Family Notified"
              done={inc.familyNotified}
              sub={inc.familyNotifiedDate ? `Notified ${inc.familyNotifiedDate}` : "Not yet notified"}
              action={!inc.familyNotified && inc.status !== "closed" ? onMarkFamily : undefined}
              actionLabel="Mark Notified"
            />
            {inc.stateReportable && (
              <NotifRow
                label="State Report Filed"
                done={!!inc.stateReportedDate}
                sub={inc.stateReportedDate ? `Submitted ${inc.stateReportedDate}` : `Due ${inc.stateReportDeadline}`}
                warn={!inc.stateReportedDate}
              />
            )}
          </div>
        </div>

        {/* Root cause */}
        {inc.rootCause && (
          <DetailSection icon={<ClipboardList size={12} />} label="Root Cause Analysis">
            <p className="text-[11px] text-foreground/80 leading-relaxed">{inc.rootCause}</p>
          </DetailSection>
        )}

        {/* Corrective actions — clickable checkboxes */}
        {inc.correctiveActions.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Corrective Actions ({inc.correctiveActions.filter((a) => a.completed).length}/{inc.correctiveActions.length} complete)
            </div>
            <div className="flex flex-col gap-2">
              {inc.correctiveActions.map((a, i) => (
                <button
                  key={i}
                  onClick={() => onToggleAction(i)}
                  disabled={inc.status === "closed"}
                  className={cn(
                    "rounded-md border p-2.5 flex items-start gap-2 w-full text-left transition-colors",
                    a.completed
                      ? "border-border bg-secondary/20 hover:bg-secondary/40"
                      : "border-accent/30 bg-accent/5 hover:bg-accent/10",
                    inc.status === "closed" && "cursor-default",
                  )}
                >
                  <div className={cn(
                    "size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                    a.completed ? "border-success bg-success/15" : "border-accent bg-accent/10",
                  )}>
                    {a.completed
                      ? <CheckCircle size={8} className="text-success" />
                      : <Clock size={8} className="text-accent" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className={cn(
                      "text-[11px] font-medium leading-snug",
                      a.completed && "line-through opacity-60",
                    )}>
                      {a.action}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {a.assignedTo.split(",")[0]} · Due {a.dueDate}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Care plan status */}
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-3 py-2">
          {inc.carePlanUpdated
            ? <CheckCircle size={12} className="text-success" />
            : <Clock size={12} className="text-accent" />
          }
          <span className="text-[11px]">
            Care plan update: {inc.carePlanUpdated ? "Completed" : "Pending"}
          </span>
        </div>

        {/* Workflow action buttons */}
        {inc.status !== "closed" && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            {isBlockedByStateReport ? (
              <button
                onClick={onFileStateReport}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-destructive text-white font-medium hover:bg-destructive/90 transition-colors"
              >
                <FileText size={11} />
                File State Report
              </button>
            ) : canAdvance && nextStep ? (
              <button
                onClick={onAdvanceWorkflow}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <ChevronRight size={11} />
                Advance → {WORKFLOW_LABELS[nextStep]}
              </button>
            ) : null}
            {inc.stateReportable && !inc.stateReportedDate && !isBlockedByStateReport && (
              <button
                onClick={onFileStateReport}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
              >
                <FileText size={11} />
                File State Report
              </button>
            )}
          </div>
        )}

        {/* Closed info */}
        {inc.closedDate && (
          <div className="rounded-md border border-success/20 bg-success/5 px-3 py-2 text-[11px] text-success flex items-center gap-2">
            <CheckCircle size={11} />
            Incident closed {inc.closedDate}{inc.closedBy ? ` by ${inc.closedBy}` : ""}
          </div>
        )}
      </div>
    </>
  );
}

function DetailSection({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {icon} {label}
      </div>
      <div className="rounded-md border border-border bg-secondary/20 px-3 py-2.5">
        {children}
      </div>
    </div>
  );
}

function NotifRow({ label, done, sub, warn, action, actionLabel }: {
  label: string;
  done: boolean;
  sub: string;
  warn?: boolean;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={cn(
        "size-4 rounded-full border flex items-center justify-center shrink-0",
        done ? "border-success bg-success/15" : warn ? "border-destructive bg-destructive/10" : "border-muted",
      )}>
        {done
          ? <CheckCircle size={8} className="text-success" />
          : warn
          ? <AlertTriangle size={8} className="text-destructive" />
          : <Clock size={8} className="text-muted-foreground" />
        }
      </div>
      <span className="font-medium">{label}</span>
      <span className={cn("text-[10px]", done ? "text-success" : warn ? "text-destructive" : "text-muted-foreground")}>
        {sub}
      </span>
      {action && actionLabel && (
        <button
          onClick={action}
          className="ml-auto text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors shrink-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function LogIncidentForm({
  onSubmit,
  onClose,
}: {
  onSubmit: (inc: Omit<Incident, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    type: "fall" as IncidentType,
    severity: 1 as IncidentSeverity,
    residentName: "",
    residentRoom: "",
    date: new Date().toISOString().slice(0, 10),
    time: "",
    location: "",
    description: "",
    reportedBy: "",
    stateReportable: false,
    stateReportDeadline: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.residentName.trim() || !form.description.trim()) return;
    onSubmit({
      type: form.type,
      residentName: form.residentName,
      residentRoom: form.residentRoom,
      date: form.date,
      time: form.time,
      reportedBy: form.reportedBy,
      severity: form.severity,
      status: "reported",
      location: form.location,
      description: form.description,
      injuries: "",
      witnesses: [],
      immediateActions: "",
      stateReportable: form.stateReportable,
      stateReportDeadline: form.stateReportable && form.stateReportDeadline ? form.stateReportDeadline : undefined,
      stateReportedDate: undefined,
      familyNotified: false,
      physicianNotified: false,
      rootCause: undefined,
      correctiveActions: [],
      carePlanUpdated: false,
    });
    onClose();
  }

  const inputCls = "w-full h-8 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <>
      <SheetHeader className="border-b border-border pb-4">
        <SheetTitle>Log New Incident</SheetTitle>
        <SheetDescription>Document an incident for tracking and workflow management.</SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="py-4 flex flex-col gap-4">
        {/* Type + Severity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Incident Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as IncidentType }))}
              className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {(Object.entries(INCIDENT_TYPE_CONFIG) as [IncidentType, { label: string; color: string }][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Severity</label>
            <div className="flex items-center gap-1.5">
              {([1, 2, 3] as IncidentSeverity[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, severity: s }))}
                  className={cn(
                    "flex-1 h-8 rounded-md border text-xs font-medium transition-colors",
                    form.severity === s
                      ? s === 3 ? "bg-destructive text-white border-destructive"
                        : s === 2 ? "bg-accent text-white border-accent"
                        : "bg-success text-white border-success"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s === 1 ? "Minor" : s === 2 ? "Moderate" : "Critical"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resident name + room */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Resident Name *</label>
            <input
              value={form.residentName}
              onChange={(e) => setForm((p) => ({ ...p, residentName: e.target.value }))}
              required
              className={inputCls}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Room</label>
            <input
              value={form.residentRoom}
              onChange={(e) => setForm((p) => ({ ...p, residentRoom: e.target.value }))}
              className={inputCls}
              placeholder="e.g. W-204"
            />
          </div>
        </div>

        {/* Date + time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Time</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Location</label>
          <input
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            className={inputCls}
            placeholder="Room, hallway, common area, etc."
          />
        </div>

        {/* Reported by */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Reported By</label>
          <input
            value={form.reportedBy}
            onChange={(e) => setForm((p) => ({ ...p, reportedBy: e.target.value }))}
            className={inputCls}
            placeholder="Name, Role"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            required
            rows={3}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Describe the incident..."
          />
        </div>

        {/* State reportable */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.stateReportable}
            onChange={(e) => setForm((p) => ({ ...p, stateReportable: e.target.checked }))}
            className="size-3.5 accent-primary"
          />
          <span className="text-xs text-foreground">State reportable incident (Form AL-1400 required)</span>
        </label>

        {form.stateReportable && (
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">Report Deadline</label>
            <input
              type="date"
              value={form.stateReportDeadline}
              onChange={(e) => setForm((p) => ({ ...p, stateReportDeadline: e.target.value }))}
              className={inputCls}
            />
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            type="submit"
            className="flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Log Incident
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
