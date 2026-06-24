import { type Resident, type ResidentClinicalData, type Assessment } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";

interface Props {
  resident: Resident;
  data: ResidentClinicalData;
}

const RISK_STYLES = {
  high: "bg-destructive/15 text-destructive border-destructive/25",
  moderate: "bg-warning/15 text-warning border-warning/25",
  low: "bg-success/15 text-success border-success/25",
};

const TYPE_LABELS: Record<Assessment["type"], string> = {
  fall_risk: "Fall Risk",
  cognitive: "Cognitive",
  adl: "ADL Level",
  pain: "Pain",
  nutrition: "Nutrition",
  skin: "Skin / Wound",
  elopement: "Elopement Risk",
};

const TODAY = "2026-05-15";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function AssessmentsTab({ data }: Props) {
  const sorted = [...data.assessments].sort((a, b) => b.completedDate.localeCompare(a.completedDate));

  return (
    <div className="space-y-3">
      {sorted.map((a) => (
        <AssessmentCard key={a.id} assessment={a} />
      ))}
      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No assessments on record.</p>
      )}
    </div>
  );
}

function AssessmentCard({ assessment: a }: { assessment: Assessment }) {
  const dueMs = new Date(a.nextDueDate).getTime();
  const todayMs = new Date(TODAY).getTime();
  const overdue = dueMs < todayMs;
  const dueSoon = !overdue && dueMs - todayMs < THIRTY_DAYS_MS;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {TYPE_LABELS[a.type] ?? a.type}
            </span>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", RISK_STYLES[a.riskLevel])}>
              {a.riskLevel} risk
            </span>
          </div>
          <h4 className="font-semibold text-sm">{a.label}</h4>
        </div>
        {a.score !== undefined && a.maxScore !== undefined && (
          <div className="text-right shrink-0">
            <div className="font-mono text-2xl font-bold leading-none">
              {a.score}
              <span className="text-sm text-muted-foreground font-normal">/{a.maxScore}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-24 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  a.riskLevel === "high" ? "bg-destructive" : a.riskLevel === "moderate" ? "bg-warning" : "bg-success",
                )}
                style={{ width: `${(a.score / a.maxScore) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{a.findings}</p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[11px] text-muted-foreground">
        <span>Completed {a.completedDate} · {a.completedBy}</span>
        <span className={cn("font-medium", overdue ? "text-destructive" : dueSoon ? "text-warning" : "")}>
          {overdue ? "OVERDUE — due " : dueSoon ? "Due soon — " : "Next due: "}
          {a.nextDueDate}
        </span>
      </div>
    </div>
  );
}
