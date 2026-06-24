import { useState } from "react";
import { CheckCircle, Clock, XCircle, PauseCircle, AlertTriangle, Info, Check, X, Pause } from "lucide-react";
import { type Resident, type ResidentClinicalData, type MedWindow, type MedStatus, type MedOverride } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";

const WINDOWS: MedWindow[] = ["AM", "Noon", "PM", "HS"];

const WINDOW_LABELS: Record<MedWindow, string> = {
  AM: "Morning Pass",
  Noon: "Noon Pass",
  PM: "Evening Pass",
  HS: "Bedtime (HS) Pass",
};

const STATUS_CONFIG = {
  given: { label: "Given", cls: "bg-success/15 text-success border-success/25", icon: CheckCircle },
  pending: { label: "Pending", cls: "bg-muted/40 text-muted-foreground border-border", icon: Clock },
  refused: { label: "Refused", cls: "bg-destructive/15 text-destructive border-destructive/25", icon: XCircle },
  held: { label: "Held", cls: "bg-warning/15 text-warning border-warning/25", icon: PauseCircle },
  na: { label: "N/A", cls: "bg-muted/40 text-muted-foreground border-border", icon: null },
} as const;

const EIGHT_RIGHTS = [
  "Right Resident",
  "Right Medication",
  "Right Dose",
  "Right Time",
  "Right Route",
  "Right Documentation",
  "Right Reason",
  "Right Response",
];

const REFUSED_REASONS = ["Resident refused", "Asleep", "Nausea/vomiting", "NPO order", "Other"];
const HELD_REASONS = ["Prescriber hold order", "Contraindicated", "Parameter not met", "Resident unavailable", "Other"];

interface Props {
  resident: Resident;
  data: ResidentClinicalData;
  overrides: Map<string, MedOverride>;
  onSetOverride: (key: string, override: MedOverride) => void;
}

export function EMarTab({ resident, data, overrides, onSetOverride }: Props) {
  const [activeWindow, setActiveWindow] = useState<MedWindow>("AM");
  const [showRights, setShowRights] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ medId: string; status: "refused" | "held" } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionReason, setActionReason] = useState("");

  const windowMeds = data.medications.filter((m) => !m.isPRN && m.windows.includes(activeWindow));
  const prnMeds = data.medications.filter((m) => m.isPRN);

  const windowPasses = windowMeds.map((m) => ({
    med: m,
    pass: m.todayPasses.find((p) => p.window === activeWindow),
    override: overrides.get(`${m.id}-${activeWindow}`),
  }));

  const effectiveStatus = (wp: typeof windowPasses[number]): MedStatus =>
    wp.override?.status ?? wp.pass?.status ?? "na";

  const givenCount = windowPasses.filter((wp) => effectiveStatus(wp) === "given").length;
  const pendingCount = windowPasses.filter((wp) => effectiveStatus(wp) === "pending").length;
  const issueCount = windowPasses.filter((wp) => {
    const s = effectiveStatus(wp);
    return s === "refused" || s === "held";
  }).length;

  function markGiven(medId: string) {
    const time = new Date().toTimeString().slice(0, 5);
    onSetOverride(`${medId}-${activeWindow}`, { status: "given", note: "", reason: "", time });
  }

  function startAction(medId: string, status: "refused" | "held") {
    setPendingAction({ medId, status });
    setActionNote("");
    setActionReason("");
  }

  function confirmAction() {
    if (!pendingAction) return;
    const time = new Date().toTimeString().slice(0, 5);
    onSetOverride(`${pendingAction.medId}-${activeWindow}`, {
      status: pendingAction.status,
      note: actionNote,
      reason: actionReason,
      time,
    });
    setPendingAction(null);
    setActionNote("");
    setActionReason("");
  }

  return (
    <div className="space-y-4">
      {/* Window selector + 8-rights toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1.5">
          {WINDOWS.map((w) => {
            const medsForW = data.medications.filter((m) => !m.isPRN && m.windows.includes(w));
            const hasPending = medsForW.some((m) => {
              const key = `${m.id}-${w}`;
              if (overrides.has(key)) return false;
              return m.todayPasses.find((p) => p.window === w && p.status === "pending");
            });
            return (
              <button
                key={w}
                onClick={() => setActiveWindow(w)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                  activeWindow === w
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {w}
                {hasPending && activeWindow !== w && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-warning" />
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowRights(!showRights)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          8-Rights Reference
        </button>
      </div>

      {/* 8-rights panel */}
      {showRights && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold text-primary mb-3">8 Rights of Medication Administration</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EIGHT_RIGHTS.map((r, i) => (
              <div key={r} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pass header */}
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-sm">{WINDOW_LABELS[activeWindow]}</h3>
        {givenCount > 0 && <span className="text-xs text-success font-mono">{givenCount} given</span>}
        {pendingCount > 0 && <span className="text-xs text-muted-foreground font-mono">{pendingCount} pending</span>}
        {issueCount > 0 && <span className="text-xs text-destructive font-mono font-semibold">{issueCount} issue{issueCount > 1 ? "s" : ""}</span>}
      </div>

      {/* Allergy reminder */}
      {resident.allergies.length > 0 && (
        <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-destructive">Allergy Alert — verify before administration: </span>
              <span className="text-xs text-destructive">
                {resident.allergies.map((a) => `${a.substance} (${a.reaction})`).join("; ")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Medication cards */}
      <div className="space-y-2">
        {windowPasses.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No medications scheduled for the {activeWindow} window.
          </div>
        )}
        {windowPasses.map(({ med, pass, override }) => {
          const status = effectiveStatus({ med, pass, override });
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const isPending = status === "pending";
          const isActionTarget = pendingAction?.medId === med.id;

          return (
            <div
              key={med.id}
              className={cn(
                "rounded-lg border p-4",
                status === "refused" || status === "held"
                  ? "border-destructive/20 bg-destructive/5"
                  : status === "given"
                  ? "border-success/20 bg-success/5"
                  : "border-border bg-surface",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-sm">{med.name}</span>
                    <span className="text-xs text-muted-foreground">{med.genericName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {med.dose} · {med.route}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Indication: {med.indication} · Prescriber: {med.prescriber}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className={cn("inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border font-medium", config.cls)}>
                    {Icon && <Icon className="w-3 h-3" />}
                    {config.label}
                  </span>
                  {(override?.time || pass?.administeredAt) && (
                    <div className="text-[11px] text-muted-foreground mt-1">{override?.time ?? pass?.administeredAt}</div>
                  )}
                  {pass?.administeredBy && !override && (
                    <div className="text-[11px] text-muted-foreground">{pass.administeredBy}</div>
                  )}
                </div>
              </div>

              {/* Inline action buttons for pending meds */}
              {isPending && !isActionTarget && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => markGiven(med.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-success/10 text-success border border-success/25 hover:bg-success/20 transition-colors"
                  >
                    <Check size={12} />
                    Mark Given
                  </button>
                  <button
                    onClick={() => startAction(med.id, "refused")}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-destructive/10 text-destructive border border-destructive/25 hover:bg-destructive/20 transition-colors"
                  >
                    <X size={12} />
                    Refused
                  </button>
                  <button
                    onClick={() => startAction(med.id, "held")}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-warning/10 text-warning border border-warning/25 hover:bg-warning/20 transition-colors"
                  >
                    <Pause size={12} />
                    Hold
                  </button>
                </div>
              )}

              {/* Reason picker for refused/held */}
              {isActionTarget && pendingAction && (
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  <p className="text-xs font-semibold capitalize">{pendingAction.status} — select reason:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(pendingAction.status === "refused" ? REFUSED_REASONS : HELD_REASONS).map((r) => (
                      <button
                        key={r}
                        onClick={() => setActionReason(r)}
                        className={cn(
                          "px-2 py-1 rounded text-xs border transition-colors",
                          actionReason === r
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <input
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    placeholder="Optional note..."
                    className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingAction(null)}
                      className="px-2.5 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAction}
                      disabled={!actionReason}
                      className="px-2.5 py-1.5 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

              {(override?.note || pass?.note) && (
                <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground italic">
                  {override?.reason && <span className="not-italic font-medium mr-1">{override.reason} —</span>}
                  {override?.note || pass?.note}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PRN medications */}
      {prnMeds.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">PRN Medications</h4>
          <div className="space-y-2">
            {prnMeds.map((med) => (
              <div key={med.id} className="rounded-lg border border-border bg-surface/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-sm">{med.name}</span>
                      <span className="text-xs text-muted-foreground">{med.genericName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-warning/25 bg-warning/10 text-warning font-medium">PRN</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{med.dose} · {med.route}</div>
                    <div className="text-xs mt-1">{med.prnIndication}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Prescriber: {med.prescriber}</div>
                  </div>
                  <button
                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-colors"
                  >
                    <Check size={12} />
                    Document PRN
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
