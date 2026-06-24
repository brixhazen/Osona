import { CheckCircle, Clock, XCircle, PauseCircle, AlertTriangle } from "lucide-react";
import { type Resident, type ResidentClinicalData, type MedStatus } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";

interface Props {
  resident: Resident;
  data: ResidentClinicalData;
}

const STATUS_ICONS: Record<MedStatus, { icon: typeof CheckCircle | null; cls: string; label: string }> = {
  given: { icon: CheckCircle, cls: "text-success", label: "Given" },
  pending: { icon: Clock, cls: "text-muted-foreground", label: "Pending" },
  refused: { icon: XCircle, cls: "text-destructive", label: "Refused" },
  held: { icon: PauseCircle, cls: "text-warning", label: "Held" },
  na: { icon: null, cls: "text-muted-foreground", label: "N/A" },
};

export function OverviewTab({ resident, data }: Props) {
  const latestVital = data.vitals.at(-1);
  const recentNote = data.notes[0];
  const openIncidents = data.incidents.filter((i) => i.status !== "closed");

  const allPasses = data.medications.flatMap((m) => m.todayPasses);
  const givenCount = allPasses.filter((p) => p.status === "given").length;
  const pendingCount = allPasses.filter((p) => p.status === "pending").length;
  const issueCount = allPasses.filter((p) => p.status === "refused" || p.status === "held").length;

  return (
    <div className="space-y-5">
      {/* Active incident banners */}
      {openIncidents.map((inc) => (
        <div key={inc.id} className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <span className="font-semibold text-sm text-destructive capitalize">
              {inc.type.replace("_", " ")} — {inc.severity} severity
            </span>
            <span className={cn(
              "ml-auto text-[10px] px-2 py-0.5 rounded-full border font-medium",
              inc.status === "open"
                ? "bg-destructive/20 text-destructive border-destructive/30"
                : "bg-warning/20 text-warning border-warning/30",
            )}>
              {inc.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{inc.date} at {inc.time} — {inc.location}</p>
          <p className="text-xs mt-1 leading-relaxed">{inc.description}</p>
        </div>
      ))}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* eMAR summary */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Today's eMAR</h4>
          <div className="flex items-end gap-4 mb-3">
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-success">{givenCount}</div>
              <div className="text-[11px] text-muted-foreground">Given</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-muted-foreground">{pendingCount}</div>
              <div className="text-[11px] text-muted-foreground">Pending</div>
            </div>
            {issueCount > 0 && (
              <div className="text-center">
                <div className="font-mono text-2xl font-bold text-destructive">{issueCount}</div>
                <div className="text-[11px] text-muted-foreground">Issues</div>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {data.medications
              .filter((m) => !m.isPRN)
              .flatMap((med) =>
                med.todayPasses.map((pass) => {
                  const s = STATUS_ICONS[pass.status];
                  const Icon = s.icon;
                  return (
                    <div key={`${med.id}-${pass.window}`} className="flex items-center gap-2 text-xs">
                      {Icon ? <Icon className={cn("w-3 h-3 shrink-0", s.cls)} /> : <span className="w-3 h-3 shrink-0" />}
                      <span className="text-muted-foreground w-8 shrink-0 font-mono text-[11px]">{pass.window}</span>
                      <span className="truncate text-[11px]">{med.name} {med.dose}</span>
                    </div>
                  );
                }),
              )}
          </div>
        </div>

        {/* Latest vitals */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Latest Vitals
            {latestVital && (
              <span className="ml-2 font-normal normal-case text-muted-foreground">{latestVital.date}</span>
            )}
          </h4>
          {latestVital ? (
            <div className="grid grid-cols-2 gap-2">
              <VitalCell label="BP" value={`${latestVital.bpSystolic}/${latestVital.bpDiastolic}`} unit="mmHg"
                alert={latestVital.bpSystolic > 160 || latestVital.bpSystolic < 90} />
              <VitalCell label="Pulse" value={`${latestVital.pulse}`} unit="bpm"
                alert={latestVital.pulse > 100 || latestVital.pulse < 50} />
              <VitalCell label="Temp" value={`${latestVital.temp}`} unit="°F"
                alert={latestVital.temp > 99.5 || latestVital.temp < 96} />
              <VitalCell label="O₂ Sat" value={`${latestVital.o2Sat}%`} unit=""
                alert={latestVital.o2Sat < 92} />
              <VitalCell label="Weight" value={`${latestVital.weightLbs}`} unit="lbs" />
              <VitalCell label="Pain" value={`${latestVital.painLevel}/10`} unit=""
                alert={latestVital.painLevel >= 7} />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No vitals on record.</p>
          )}
        </div>

        {/* Most recent note */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Most Recent Note</h4>
          {recentNote ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <NoteTypeBadge type={recentNote.type} />
                <span className="text-[11px] text-muted-foreground">{recentNote.date} {recentNote.time}</span>
              </div>
              <p className="font-medium text-sm mb-1">{recentNote.subject}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-5">{recentNote.body}</p>
              <p className="text-[11px] text-muted-foreground mt-2">— {recentNote.author}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No notes recorded.</p>
          )}
        </div>
      </div>

      {/* Risk profile */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Risk Profile</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          <RiskPill label="Fall Risk" level={resident.fallRisk} />
          <RiskPill label="Elopement Risk" level={resident.elopementRisk} />
          {resident.dnr && (
            <span className="inline-flex items-center text-xs px-3 py-1.5 rounded-full border border-destructive/30 bg-destructive/10 text-destructive font-medium">
              DNR — {resident.codeStatus}
            </span>
          )}
          <span className="inline-flex items-center text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground">
            HCP: {resident.healthcareProxy}
          </span>
        </div>
        <div className="pt-3 border-t border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Allergies: </span>
          {resident.allergies.length === 0 ? (
            <span className="text-xs text-success">NKDA — No known drug allergies</span>
          ) : (
            resident.allergies.map((a, i) => (
              <span
                key={i}
                className={cn(
                  "text-xs mr-3",
                  a.severity === "severe"
                    ? "text-destructive font-semibold"
                    : a.severity === "moderate"
                    ? "text-warning"
                    : "text-foreground",
                )}
              >
                {a.substance} — {a.reaction}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function VitalCell({
  label, value, unit, alert,
}: {
  label: string; value: string; unit: string; alert?: boolean;
}) {
  return (
    <div className={cn("rounded-md p-2", alert ? "bg-destructive/10" : "bg-surface-2/40")}>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className={cn("font-mono text-base font-semibold leading-tight", alert ? "text-destructive" : "")}>
        {value}
        {unit && <span className="text-[10px] font-normal text-muted-foreground ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

function RiskPill({ label, level }: { label: string; level: "low" | "moderate" | "high" }) {
  const styles = {
    high: "border-destructive/30 bg-destructive/10 text-destructive",
    moderate: "border-warning/30 bg-warning/10 text-warning",
    low: "border-success/30 bg-success/10 text-success",
  };
  return (
    <span className={cn("inline-flex items-center text-xs px-3 py-1.5 rounded-full border font-medium", styles[level])}>
      {label}: {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function NoteTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    shift: "bg-primary/10 text-primary border-primary/20",
    clinical: "bg-warning/10 text-warning border-warning/20",
    physician: "bg-success/10 text-success border-success/20",
    family: "bg-muted/50 text-muted-foreground border-border",
  };
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", styles[type] ?? styles.shift)}>
      {type}
    </span>
  );
}
