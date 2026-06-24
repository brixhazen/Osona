import { BRIEFING } from "@/lib/mock/dashboard";
import { getMaintenanceMetrics, getTrainingMetrics, getComplianceMetrics, getCrmMetrics } from "@/lib/appStore";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

const BORDER = {
  tour:      "border-l-[hsl(210_85%_60%)]",
  task:      "border-l-accent",
  clinical:  "border-l-success",
  emergency: "border-l-destructive",
  warning:   "border-l-accent",
} as const;

type BriefingKind = keyof typeof BORDER;

interface BriefingItem {
  time: string;
  text: string;
  kind: BriefingKind;
  alert?: boolean;
}

export function OperationsBriefing() {
  const maintenance = getMaintenanceMetrics();
  const training = getTrainingMetrics();
  const compliance = getComplianceMetrics();
  const crm = getCrmMetrics();

  const liveItems: BriefingItem[] = [];

  maintenance.emergencyList.forEach((wo) => {
    liveItems.push({
      time: "LIVE",
      text: `Emergency WO ${wo.id} — ${wo.title} · ${wo.location}${wo.assignedTo ? ` · ${wo.assignedTo}` : " · Unassigned"}`,
      kind: "emergency",
      alert: true,
    });
  });

  if (compliance.statePending > 0) {
    liveItems.push({
      time: "LIVE",
      text: `${compliance.statePending} state-reportable incident${compliance.statePending !== 1 ? "s" : ""} pending submission`,
      kind: "emergency",
      alert: true,
    });
  }

  if (training.staffWithOverdue > 0) {
    liveItems.push({
      time: "LIVE",
      text: `${training.staffWithOverdue} staff ${training.staffWithOverdue === 1 ? "has" : "have"} mandatory annual training overdue`,
      kind: "warning",
      alert: true,
    });
  }

  if (crm.overdueFollowUps > 0) {
    liveItems.push({
      time: "LIVE",
      text: `${crm.overdueFollowUps} CRM follow-up${crm.overdueFollowUps !== 1 ? "s" : ""} overdue — ${crm.activeLeads} active lead${crm.activeLeads !== 1 ? "s" : ""} in pipeline`,
      kind: "warning",
      alert: true,
    });
  }

  if (crm.depositsCount > 0) {
    liveItems.push({
      time: "CRM",
      text: `${crm.depositsCount} deposit${crm.depositsCount !== 1 ? "s" : ""} pending move-in · $${(crm.pipelineValue / 1000).toFixed(1)}k projected monthly revenue`,
      kind: "clinical",
      alert: false,
    });
  }

  const items: BriefingItem[] = [
    ...liveItems,
    ...BRIEFING.map((b) => ({ ...b, kind: b.kind as BriefingKind })),
  ];

  return (
    <div className="rounded-lg bg-card border border-border p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display font-semibold tracking-tight">Today's Operations Briefing</h3>
        <span className="text-xs text-muted-foreground">{items.length} events</span>
      </div>
      <ol className="space-y-2">
        {items.map((b, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-3 pl-3 py-2 border-l-2 bg-surface-2/30 rounded-r-md",
              BORDER[b.kind],
              b.alert && "bg-destructive/4",
            )}
          >
            <div className={cn(
              "font-mono text-xs w-16 shrink-0 pt-0.5",
              b.alert ? "text-destructive font-semibold" : "text-muted-foreground",
            )}>
              {b.time}
            </div>
            <div className={cn("text-sm flex items-start gap-1.5", b.alert && "text-destructive/90")}>
              {b.alert && <AlertTriangle size={12} className="mt-0.5 shrink-0 text-destructive" />}
              {b.text}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
