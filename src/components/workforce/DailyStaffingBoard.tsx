import { STAFF, type DailyShift, type ShiftSlot, type ShiftPeriod, type StaffMember } from "@/lib/mock/workforce";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, UserX, UserPlus } from "lucide-react";

const MODULE_COLOR = "#818CF8";

const STAFF_MAP = new Map<string, StaffMember>(STAFF.map((s) => [s.id, s]));

const PERIOD_STYLES = {
  Day:     { dot: "bg-amber-400"  },
  Evening: { dot: "bg-orange-400" },
  Night:   { dot: "bg-indigo-400" },
};

interface Props {
  shifts: DailyShift[];
  onFillSlot?: (period: ShiftPeriod, slotIndex: number) => void;
}

export function DailyStaffingBoard({ shifts, onFillSlot }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {shifts.map((shift) => (
        <ShiftCard key={shift.period} shift={shift} onFillSlot={onFillSlot} />
      ))}
    </div>
  );
}

function ShiftCard({
  shift,
  onFillSlot,
}: {
  shift: DailyShift;
  onFillSlot?: (period: ShiftPeriod, slotIndex: number) => void;
}) {
  const filled = shift.slots.filter((s) => s.status === "scheduled" || s.status === "agency_fill").length;
  const total = shift.slots.length;
  const openCount = shift.slots.filter((s) => s.status === "open").length;
  const calloutCount = shift.slots.filter((s) => s.status === "called_out").length;
  const fillPct = (filled / total) * 100;
  const hasGap = openCount > 0 || calloutCount > 0;
  const dot = PERIOD_STYLES[shift.period].dot;

  return (
    <div className={cn(
      "rounded-lg border bg-card overflow-hidden",
      hasGap ? "border-accent/30" : "border-border",
    )}>
      {/* Shift header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <span className={cn("size-2 rounded-full shrink-0", dot)} />
        <div>
          <span className="font-medium text-sm">{shift.period} Shift</span>
          <span className="text-xs text-muted-foreground ml-2 font-mono">{shift.timeRange}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {hasGap && (
            <span className="text-[11px] text-accent flex items-center gap-1">
              <AlertTriangle size={11} />
              {openCount > 0 && <span>{openCount} open</span>}
              {openCount > 0 && calloutCount > 0 && <span>·</span>}
              {calloutCount > 0 && <span>{calloutCount} callout</span>}
            </span>
          )}
          <span className="text-xs text-muted-foreground font-mono">
            {filled}/{total} filled
          </span>
          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                fillPct === 100 ? "bg-success" : fillPct >= 80 ? "bg-accent" : "bg-destructive",
              )}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Slot list */}
      <div className="divide-y divide-border/50">
        {shift.slots.map((slot, i) => (
          <SlotRow
            key={i}
            slot={slot}
            slotIndex={i}
            period={shift.period}
            onFillSlot={onFillSlot}
          />
        ))}
      </div>
    </div>
  );
}

function SlotRow({
  slot,
  slotIndex,
  period,
  onFillSlot,
}: {
  slot: ShiftSlot;
  slotIndex: number;
  period: ShiftPeriod;
  onFillSlot?: (period: ShiftPeriod, slotIndex: number) => void;
}) {
  const staff = slot.staffId ? STAFF_MAP.get(slot.staffId) : null;

  if (slot.status === "open") {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-accent/5">
        <div className="size-2 rounded-full bg-accent animate-pulse shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-accent">OPEN SHIFT</div>
          <div className="text-[11px] text-muted-foreground">{slot.role} · {slot.unit}</div>
        </div>
        <RoleBadge role={slot.role} />
        {onFillSlot && (
          <button
            onClick={() => onFillSlot(period, slotIndex)}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: `${MODULE_COLOR}80`, color: MODULE_COLOR }}
          >
            <UserPlus size={11} />
            Fill
          </button>
        )}
      </div>
    );
  }

  if (slot.status === "called_out") {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-destructive/5">
        <UserX size={14} className="text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-destructive">CALLED OUT</div>
          <div className="text-[11px] text-muted-foreground truncate">{slot.calloutReason}</div>
        </div>
        <RoleBadge role={slot.role} />
        {onFillSlot && (
          <button
            onClick={() => onFillSlot(period, slotIndex)}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium border transition-colors hover:opacity-80"
            style={{ borderColor: `${MODULE_COLOR}80`, color: MODULE_COLOR }}
          >
            <UserPlus size={11} />
            Fill
          </button>
        )}
      </div>
    );
  }

  // scheduled or agency_fill
  const certAlert = staff ? staff.certifications.find((c) => c.status === "expired" || c.status === "expiring_soon") : null;
  const isNearOt = staff ? staff.hoursThisWeek >= staff.overtimeThreshold - 4 : false;
  const isBurnoutRisk = staff ? staff.consecutiveDays >= 5 : false;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/30 transition-colors">
      <div className={cn(
        "size-2 rounded-full shrink-0",
        slot.status === "agency_fill" ? "bg-purple-400" : "bg-success",
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {staff ? staff.name : slot.agencyName ?? "Agency Staff"}
          </span>
          {certAlert && (
            <AlertTriangle
              size={11}
              className={cn(certAlert.status === "expired" ? "text-destructive" : "text-accent")}
            />
          )}
          {isNearOt && (
            <Clock size={11} className="text-accent" />
          )}
        </div>
        <div className="text-[11px] text-muted-foreground">{slot.unit}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isBurnoutRisk && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
            {staff?.consecutiveDays}d streak
          </span>
        )}
        <RoleBadge role={slot.role} />
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    RN: "bg-primary/10 text-primary",
    LPN: "bg-primary/10 text-primary",
    CNA: "bg-secondary text-secondary-foreground",
    "Med Tech": "bg-success/10 text-success",
    Activities: "bg-accent/10 text-accent",
    Dietary: "bg-muted text-muted-foreground",
    Maintenance: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium", colors[role] ?? "bg-muted text-muted-foreground")}>
      {role}
    </span>
  );
}
