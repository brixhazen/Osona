import { cn } from "@/lib/utils";
import { AlertTriangle, Check, X, Star } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { STAFF, type ShiftPeriod, type StaffRole } from "@/lib/mock/workforce";
import { scoreStaff, type Eligibility } from "@/lib/workforceUtils";

export interface AssignTarget {
  period: ShiftPeriod;
  slotIndex: number;
  role: StaffRole;
  unit: string;
}

interface Props {
  target: AssignTarget | null;
  onAssign: (period: ShiftPeriod, slotIndex: number, staffId: string) => void;
  onClose: () => void;
  assignedShifts?: Map<string, ShiftPeriod>;
}

export function ShiftAssignmentSheet({ target, onAssign, onClose, assignedShifts }: Props) {
  if (!target) return null;

  const results = STAFF
    .map((s) => scoreStaff(s, target.role, target.period, assignedShifts))
    .filter((e) => e.score >= 0)
    .sort((a, b) => b.score - a.score);

  const recommended = results.filter((e) => !e.blocked && e.score >= 85);
  const available   = results.filter((e) => !e.blocked && e.score < 85);
  const blocked     = results.filter((e) => e.blocked);

  const PERIOD_COLOR: Record<ShiftPeriod, string> = {
    Day: "text-amber-600 dark:text-amber-400",
    Evening: "text-orange-600 dark:text-orange-400",
    Night: "text-indigo-500 dark:text-indigo-400",
  };

  return (
    <Sheet open={!!target} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-[440px] sm:max-w-[440px] overflow-y-auto flex flex-col">
        <SheetHeader className="border-b border-border pb-4 shrink-0">
          <SheetTitle>Fill Shift</SheetTitle>
          <SheetDescription>
            <span className={cn("font-medium", PERIOD_COLOR[target.period])}>{target.period} Shift</span>
            {" · "}{target.role} · {target.unit}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-5">
          {recommended.length > 0 && (
            <Section label="Recommended" icon={<Star size={11} className="text-[#818CF8]" />}>
              {recommended.map((e) => (
                <StaffRow key={e.staff.id} e={e} onAssign={() => onAssign(target.period, target.slotIndex, e.staff.id)} />
              ))}
            </Section>
          )}

          {available.length > 0 && (
            <Section label="Available">
              {available.map((e) => (
                <StaffRow key={e.staff.id} e={e} onAssign={() => onAssign(target.period, target.slotIndex, e.staff.id)} />
              ))}
            </Section>
          )}

          {blocked.length > 0 && (
            <Section label="Blocked" muted>
              {blocked.map((e) => (
                <StaffRow key={e.staff.id} e={e} blocked />
              ))}
            </Section>
          )}

          {results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No {target.role} staff found in roster.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ label, icon, muted, children }: {
  label: string; icon?: React.ReactNode; muted?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold mb-2 px-1">
        {icon}
        <span className={muted ? "text-muted-foreground" : "text-foreground/70"}>{label}</span>
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function StaffRow({ e, onAssign, blocked }: { e: Eligibility; onAssign?: () => void; blocked?: boolean }) {
  const hoursLeft = e.staff.overtimeThreshold - e.staff.hoursThisWeek;
  const statusLabel: Record<string, string> = {
    full_time: "FT", part_time: "PT", prn: "PRN", agency: "Agency",
  };

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg border",
      blocked ? "border-border/40 bg-muted/20 opacity-60" : "border-border bg-card hover:bg-muted/30 transition-colors",
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-sm font-medium", blocked && "text-muted-foreground")}>
            {e.staff.name}
          </span>
          <span className="text-[10px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-medium">
            {statusLabel[e.staff.status]}
          </span>
          {e.staff.todayShift && (
            <span className="text-[10px] text-muted-foreground">· on {e.staff.todayShift}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px] text-muted-foreground">{e.staff.primaryUnit}</span>
          <span className="text-[11px] text-muted-foreground">· {hoursLeft}h avail</span>
          {e.staff.consecutiveDays > 0 && (
            <span className="text-[11px] text-muted-foreground">· {e.staff.consecutiveDays}d streak</span>
          )}
        </div>
        {e.warnings.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {e.warnings.map((w) => (
              <span key={w} className={cn(
                "flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded",
                blocked ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent",
              )}>
                {blocked ? <X size={9} /> : <AlertTriangle size={9} />}
                {w}
              </span>
            ))}
          </div>
        )}
      </div>
      {!blocked && (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#818CF8]/10 text-[#818CF8] shrink-0">
          {e.score}
        </span>
      )}
      {!blocked && onAssign && (
        <button
          onClick={onAssign}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-white"
          style={{ backgroundColor: "#818CF8" }}
        >
          <Check size={11} />
          Assign
        </button>
      )}
    </div>
  );
}
