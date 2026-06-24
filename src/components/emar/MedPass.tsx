import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X, Pause, UserX, ChevronDown, ChevronUp } from "lucide-react";
import {
  PASS_TIMES, PASS_CONFIG, ROUTE_LABELS, STATUS_CONFIG, STAFF,
  type EmarResident, type Medication, type MedAdministration, type PassTime, type AdminStatus,
} from "@/lib/mock/emar";

interface Props {
  residents: EmarResident[];
  medications: Medication[];
  administrations: MedAdministration[];
  activePass: PassTime;
  onChangePass: (p: PassTime) => void;
  onAddAdministration: (adm: MedAdministration) => void;
}

export function MedPass({ residents, medications, administrations, activePass, onChangePass, onAddAdministration }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const residentsForPass = residents.filter((r) =>
    medications.some((m) => m.residentId === r.id && m.active && !m.isPrn && m.scheduledPasses.includes(activePass)),
  );

  const totalMeds = medications.filter((m) => m.active && !m.isPrn && m.scheduledPasses.includes(activePass)).length;
  const documented = administrations.filter((a) => a.date === today && a.passTime === activePass).length;
  const pct = totalMeds > 0 ? Math.round((documented / totalMeds) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Pass selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {PASS_TIMES.map((p) => {
          const cfg = PASS_CONFIG[p];
          const meds = medications.filter((m) => m.active && !m.isPrn && m.scheduledPasses.includes(p));
          const done = administrations.filter((a) => a.date === today && a.passTime === p).length;
          const isActive = p === activePass;
          return (
            <button
              key={p}
              onClick={() => onChangePass(p)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                isActive ? cn(cfg.cls, "ring-1 ring-current") : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30",
              )}
            >
              <span>{cfg.label}</span>
              <span className="font-mono text-[11px]">{done}/{meds.length}</span>
              {done === meds.length && meds.length > 0 && (
                <Check size={11} className="text-success" />
              )}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">{documented} of {totalMeds} documented</span>
          <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", pct === 100 ? "bg-success" : "bg-primary")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-mono font-semibold">{pct}%</span>
        </div>
      </div>

      {/* Resident cards */}
      <div className="flex flex-col gap-3">
        {residentsForPass.map((resident) => (
          <ResidentMedCard
            key={resident.id}
            resident={resident}
            medications={medications.filter((m) => m.residentId === resident.id && m.active && !m.isPrn && m.scheduledPasses.includes(activePass))}
            administrations={administrations.filter((a) => a.residentId === resident.id && a.passTime === activePass && a.date === today)}
            activePass={activePass}
            today={today}
            onAddAdministration={onAddAdministration}
          />
        ))}
      </div>
    </div>
  );
}

function ResidentMedCard({
  resident, medications, administrations, activePass, today, onAddAdministration,
}: {
  resident: EmarResident;
  medications: Medication[];
  administrations: MedAdministration[];
  activePass: PassTime;
  today: string;
  onAddAdministration: (adm: MedAdministration) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const total = medications.length;
  const documented = administrations.length;
  const allGiven = administrations.every((a) => a.status === "given") && documented === total;
  const hasRefusal = administrations.some((a) => a.status === "refused");
  const hasHeld = administrations.some((a) => a.status === "held");

  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      hasRefusal ? "border-destructive/30" : hasHeld ? "border-warning/30" : allGiven ? "border-success/20" : "border-border",
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/20 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{resident.name}</span>
            <span className="text-[11px] text-muted-foreground">{resident.room} · {resident.wing}</span>
            {resident.allergies.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                Allergy: {resident.allergies.join(", ")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            "text-[11px] font-mono font-semibold",
            allGiven ? "text-success" : hasRefusal ? "text-destructive" : "text-muted-foreground",
          )}>
            {documented}/{total}
          </span>
          {allGiven && <Check size={13} className="text-success" />}
          {hasRefusal && <X size={13} className="text-destructive" />}
          {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </button>

      {/* Med rows */}
      {expanded && (
        <div className="divide-y divide-border/50">
          {medications.map((med) => {
            const existing = administrations.find((a) => a.medicationId === med.id);
            return (
              <MedRow
                key={med.id}
                med={med}
                existing={existing}
                resident={resident}
                activePass={activePass}
                today={today}
                onAddAdministration={onAddAdministration}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function MedRow({
  med, existing, resident, activePass, today, onAddAdministration,
}: {
  med: Medication;
  existing: MedAdministration | undefined;
  resident: EmarResident;
  activePass: PassTime;
  today: string;
  onAddAdministration: (adm: MedAdministration) => void;
}) {
  const [logging, setLogging] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AdminStatus | null>(null);
  const [notes, setNotes] = useState("");
  const [staffInitials, setStaffInitials] = useState(STAFF[0]);

  function commit() {
    if (!pendingStatus) return;
    onAddAdministration({
      id: `adm-${Date.now()}-${med.id}`,
      medicationId: med.id,
      residentId: resident.id,
      passTime: activePass,
      date: today,
      status: pendingStatus,
      givenAt: pendingStatus === "given" ? new Date().toTimeString().slice(0, 5) : undefined,
      givenBy: staffInitials,
      notes: notes.trim() || undefined,
      refusalReason: pendingStatus === "refused" ? notes.trim() : undefined,
      heldReason: pendingStatus === "held" ? notes.trim() : undefined,
    });
    setLogging(false);
    setNotes("");
    setPendingStatus(null);
  }

  const statusCfg = existing ? STATUS_CONFIG[existing.status] : null;

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        {/* Med info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{med.name}</span>
            <span className="text-xs text-muted-foreground">{med.dose}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground border border-border">
              {ROUTE_LABELS[med.route]}
            </span>
            {med.isControlled && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                CII{med.controlledSchedule}
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{med.indication}</div>
          {med.instructions && (
            <div className="text-[10px] text-accent mt-0.5 italic">{med.instructions}</div>
          )}
          {existing && (
            <div className="text-[10px] text-muted-foreground mt-1">
              {existing.givenAt && `Given at ${existing.givenAt} · `}{existing.givenBy}
              {existing.refusalReason && ` · ${existing.refusalReason}`}
              {existing.heldReason && ` · ${existing.heldReason}`}
            </div>
          )}
        </div>

        {/* Status / action */}
        <div className="shrink-0">
          {existing && !logging ? (
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[11px] px-2 py-1 rounded border font-medium", statusCfg?.cls)}>
                {statusCfg?.label}
              </span>
              <button
                onClick={() => { setLogging(true); setPendingStatus(existing.status); setNotes(existing.notes ?? ""); }}
                className="text-[10px] text-muted-foreground hover:text-primary transition-colors px-1"
              >
                Edit
              </button>
            </div>
          ) : !logging ? (
            <div className="flex gap-1">
              {(["given", "refused", "held", "not_available"] as AdminStatus[]).map((s) => {
                type ActionStatus = "given" | "refused" | "held" | "not_available";
                const icons: Record<ActionStatus, typeof Check> = { given: Check, refused: X, held: Pause, not_available: UserX };
                const colors: Record<ActionStatus, string> = {
                  given: "border-success/30 text-success hover:bg-success/10",
                  refused: "border-destructive/30 text-destructive hover:bg-destructive/10",
                  held: "border-warning/30 text-warning hover:bg-warning/10",
                  not_available: "border-border text-muted-foreground hover:bg-muted/30",
                };
                const Icon = icons[s as ActionStatus];
                return (
                  <button
                    key={s}
                    onClick={() => { setPendingStatus(s); setLogging(true); }}
                    title={STATUS_CONFIG[s].label}
                    className={cn("p-1.5 rounded border transition-colors", colors[s as ActionStatus])}
                  >
                    <Icon size={12} />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Inline log form */}
      {logging && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            {(["given", "refused", "held", "not_available"] as AdminStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setPendingStatus(s)}
                className={cn(
                  "px-2.5 py-1 rounded border text-[11px] font-medium transition-colors",
                  pendingStatus === s
                    ? cn(STATUS_CONFIG[s].cls, "ring-1 ring-current")
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
          {(pendingStatus === "refused" || pendingStatus === "held") && (
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={pendingStatus === "refused" ? "Reason for refusal..." : "Reason held..."}
              autoFocus
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          )}
          <div className="flex items-center gap-2">
            <select
              value={staffInitials}
              onChange={(e) => setStaffInitials(e.target.value)}
              className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {STAFF.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={() => { setLogging(false); setPendingStatus(null); setNotes(""); }}
              className="px-2.5 py-1 rounded border border-border text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={commit}
              disabled={!pendingStatus}
              className="px-2.5 py-1 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
