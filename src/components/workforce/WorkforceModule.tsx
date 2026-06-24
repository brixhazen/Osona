import { useState, useMemo } from "react";
import {
  calcPPD, calcTodayHours,
  TODAY_SHIFTS, OPEN_SHIFTS, CALLOUT_LOG, CALLOUTS_THIS_WEEK,
  AGENCY_HOURS_THIS_WEEK, AGENCY_HOURS_THIS_MONTH,
  CENSUS_TODAY, PPD_TARGET, PPD_MINIMUM, STAFF,
  type DailyShift, type OpenShift, type CalloutRecord,
  type ShiftPeriod, type NotifResponse, type SlotStatus,
} from "@/lib/mock/workforce";
import { DailyStaffingBoard } from "./DailyStaffingBoard";
import { OpenShiftsPanel } from "./OpenShiftsPanel";
import { StaffRoster } from "./StaffRoster";
import { WeekGrid } from "./WeekGrid";
import { ShiftAssignmentSheet, type AssignTarget } from "./ShiftAssignmentSheet";
import { CredentialsView } from "./CredentialsView";
import { cn } from "@/lib/utils";
import { AlertTriangle, Building2, Clock, Users } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { syncWorkforceShifts, syncWorkforceOpenShifts } from "@/lib/appStore";

const MODULE_COLOR = "#818CF8";

type View = "schedule" | "week" | "roster" | "credentials";

const VIEWS: { id: View; label: string }[] = [
  { id: "schedule",    label: "Today's Schedule" },
  { id: "week",        label: "Week View"         },
  { id: "roster",      label: "Staff Roster"      },
  { id: "credentials", label: "Credentials"       },
];

export function WorkforceModule() {
  const [view, setView] = useState<View>("schedule");
  const [localShifts, setLocalShifts]           = useState<DailyShift[]>([...TODAY_SHIFTS]);
  const [localOpenShifts, setLocalOpenShifts]   = useState<OpenShift[]>([...OPEN_SHIFTS]);
  const [localCallouts, setLocalCallouts]       = useState<CalloutRecord[]>([...CALLOUT_LOG]);
  const [assignTarget, setAssignTarget]         = useState<AssignTarget | null>(null);

  // Track UI-assigned staff (those with null todayShift in mock) so scorer stays accurate
  const assignedShifts = useMemo(() => {
    const mockScheduled = new Set(STAFF.filter((s) => s.todayShift !== null).map((s) => s.id));
    const map = new Map<string, ShiftPeriod>();
    for (const shift of localShifts) {
      for (const slot of shift.slots) {
        if (slot.staffId && slot.status === "scheduled" && !mockScheduled.has(slot.staffId)) {
          map.set(slot.staffId, shift.period);
        }
      }
    }
    return map;
  }, [localShifts]);

  const { scheduled: scheduledHours } = calcTodayHours(localShifts);
  const ppd = calcPPD(CENSUS_TODAY, scheduledHours);
  const ppdStatus: "danger" | "warn" | "ok" =
    ppd < PPD_MINIMUM ? "danger" : ppd < PPD_TARGET ? "warn" : "ok";

  const allSlots = localShifts.flatMap((s) => s.slots);
  const scheduledCount = allSlots.filter((s) => s.status === "scheduled").length;
  const openCount = allSlots.filter((s) => s.status === "open" || s.status === "called_out").length;

  const expiredCerts = STAFF.flatMap((s) => s.certifications.filter((c) => c.status === "expired")).length;
  const expiringSoon = STAFF.flatMap((s) => s.certifications.filter((c) => c.status === "expiring_soon")).length;

  // Open a slot in the ShiftAssignmentSheet from the DailyStaffingBoard
  function handleFillSlot(period: ShiftPeriod, slotIndex: number) {
    const shift = localShifts.find((s) => s.period === period);
    const slot = shift?.slots[slotIndex];
    if (!slot) return;
    setAssignTarget({ period, slotIndex, role: slot.role, unit: slot.unit });
  }

  // Assign a staff member to a slot (from ShiftAssignmentSheet)
  function assignSlot(period: ShiftPeriod, slotIndex: number, staffId: string) {
    const shift = localShifts.find((s) => s.period === period);
    const slot = shift?.slots[slotIndex];

    setLocalShifts((prev) => {
      const next = prev.map((s) => {
        if (s.period !== period) return s;
        const newSlots = [...s.slots];
        newSlots[slotIndex] = { ...newSlots[slotIndex], staffId, status: "scheduled" as SlotStatus };
        return { ...s, slots: newSlots };
      });
      syncWorkforceShifts(next);
      return next;
    });

    // Remove matching open shift entry
    if (slot && (slot.status === "open" || slot.status === "called_out")) {
      setLocalOpenShifts((prev) => {
        const next = prev.filter((os) => !(os.period === period && os.role === slot.role));
        syncWorkforceOpenShifts(next.length);
        return next;
      });
    }

    setAssignTarget(null);
  }

  // Assign a staff member directly from OpenShiftsPanel suggestion
  function fillOpenShift(openShiftId: string, staffId: string) {
    const openShift = localOpenShifts.find((os) => os.id === openShiftId);
    if (!openShift) return;

    setLocalShifts((prev) => {
      const next = prev.map((shift) => {
        if (shift.period !== openShift.period) return shift;
        const slotIdx = shift.slots.findIndex(
          (s) => (s.status === "open" || s.status === "called_out") && s.role === openShift.role,
        );
        if (slotIdx === -1) return shift;
        const newSlots = [...shift.slots];
        newSlots[slotIdx] = { ...newSlots[slotIdx], staffId, status: "scheduled" as SlotStatus };
        return { ...shift, slots: newSlots };
      });
      syncWorkforceShifts(next);
      return next;
    });

    setLocalOpenShifts((prev) => {
      const next = prev.filter((os) => os.id !== openShiftId);
      syncWorkforceOpenShifts(next.length);
      return next;
    });
  }

  // Update response on a notification row
  function markResponse(openShiftId: string, staffId: string, response: NotifResponse) {
    setLocalOpenShifts((prev) =>
      prev.map((os) => {
        if (os.id !== openShiftId) return os;
        return {
          ...os,
          notified: os.notified.map((n) => (n.staffId === staffId ? { ...n, response } : n)),
        };
      }),
    );
  }

  // Add staff to notified list
  function notifyStaff(openShiftId: string, staffIds: string[], names: string[]) {
    setLocalOpenShifts((prev) =>
      prev.map((os) => {
        if (os.id !== openShiftId) return os;
        const existing = new Set(os.notified.map((n) => n.staffId));
        const newRows = staffIds
          .filter((id) => !existing.has(id))
          .map((id, i) => ({ staffId: id, name: names[i], response: "no_response" as NotifResponse }));
        return { ...os, notified: [...os.notified, ...newRows] };
      }),
    );
  }

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <ModuleHeader
        name="Workforce Management"
        description="Staffing, scheduling, PPD tracking, and credential compliance."
        icon={Users}
        color={MODULE_COLOR}
      />

      {/* KPI bar */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3">
        <PpdCard ppd={ppd} status={ppdStatus} scheduledHours={scheduledHours} census={CENSUS_TODAY} />
        <KpiCard icon={<Users size={15} />} label="On Shift Today" value={String(scheduledCount)} sub={`${openCount} gaps`} />
        <KpiCard
          icon={<AlertTriangle size={15} />}
          label="Open Slots"
          value={String(localOpenShifts.length)}
          sub="need filling"
          tone={localOpenShifts.length > 0 ? "warn" : undefined}
        />
        <KpiCard
          icon={<Clock size={15} />}
          label="Callouts This Week"
          value={String(CALLOUTS_THIS_WEEK)}
          sub={`${localCallouts.length} today`}
          tone={CALLOUTS_THIS_WEEK > 2 ? "warn" : undefined}
        />
        <KpiCard
          icon={<Building2 size={15} />}
          label="Agency Hours"
          value={`${AGENCY_HOURS_THIS_WEEK}h`}
          sub={`${AGENCY_HOURS_THIS_MONTH}h this month`}
        />
      </div>

      {/* Credential alert bar */}
      {(expiredCerts > 0 || expiringSoon > 0) && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-2.5 flex items-center gap-3">
          <AlertTriangle size={14} className="text-destructive shrink-0" />
          <span className="text-sm">
            {expiredCerts > 0 && (
              <span className="text-destructive font-medium">
                {expiredCerts} expired credential{expiredCerts !== 1 ? "s" : ""}
              </span>
            )}
            {expiredCerts > 0 && expiringSoon > 0 && (
              <span className="text-muted-foreground"> · </span>
            )}
            {expiringSoon > 0 && (
              <span className="text-accent font-medium">
                {expiringSoon} expiring within 90 days
              </span>
            )}
            <span className="text-muted-foreground"> — compliance review required</span>
          </span>
          <button
            onClick={() => setView("credentials")}
            className="ml-auto text-xs text-destructive hover:text-destructive/80 font-medium"
          >
            View Credentials →
          </button>
        </div>
      )}

      {/* View tabs */}
      <div className="flex border-b border-border">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={cn(
              "px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              view === v.id
                ? "border-b-2"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            style={view === v.id ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
          >
            {v.label}
            {v.id === "schedule" && openCount > 0 && (
              <span className="ml-1.5 font-mono text-[10px] bg-accent/10 text-accent px-1 py-0.5 rounded">
                {openCount}
              </span>
            )}
            {v.id === "credentials" && expiredCerts > 0 && (
              <span className="ml-1.5 font-mono text-[10px] bg-destructive/10 text-destructive px-1 py-0.5 rounded">
                {expiredCerts}
              </span>
            )}
          </button>
        ))}
      </div>

      {view === "schedule" && (
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            <DailyStaffingBoard shifts={localShifts} onFillSlot={handleFillSlot} />
          </div>
          <div className="w-[340px] shrink-0">
            <OpenShiftsPanel
              openShifts={localOpenShifts}
              callouts={localCallouts}
              assignedShifts={assignedShifts}
              onFillShift={fillOpenShift}
              onMarkResponse={markResponse}
              onNotifyStaff={notifyStaff}
            />
          </div>
        </div>
      )}

      {view === "week" && <WeekGrid todayShifts={localShifts} />}

      {view === "roster" && <StaffRoster staff={STAFF} />}
      {view === "credentials" && <CredentialsView staff={STAFF} />}

      <ShiftAssignmentSheet
        target={assignTarget}
        onAssign={assignSlot}
        onClose={() => setAssignTarget(null)}
        assignedShifts={assignedShifts}
      />
    </div>
  );
}

// ── PPD Gauge Card ─────────────────────────────────────────────────────────────

const GAUGE_MAX = 4.0;

function PpdCard({
  ppd, status, scheduledHours, census,
}: { ppd: number; status: "danger" | "warn" | "ok"; scheduledHours: number; census: number }) {
  const ppdPct = Math.min((ppd / GAUGE_MAX) * 100, 100);
  const minPct = (PPD_MINIMUM / GAUGE_MAX) * 100;
  const targetPct = (PPD_TARGET / GAUGE_MAX) * 100;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Paid Hours Per Resident Day</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className={cn(
              "font-mono text-3xl font-semibold tabular-nums",
              status === "danger" ? "text-destructive" : status === "warn" ? "text-accent" : "text-success",
            )}>
              {ppd.toFixed(2)}
            </span>
            <span className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              status === "danger"
                ? "bg-destructive/10 text-destructive"
                : status === "warn"
                  ? "bg-accent/10 text-accent"
                  : "bg-success/10 text-success",
            )}>
              {status === "danger" ? "Below Minimum" : status === "warn" ? "Below Target" : "On Target"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Census</div>
          <div className="font-mono text-sm">{census} residents</div>
          <div className="text-[10px] text-muted-foreground mt-1">Scheduled</div>
          <div className="font-mono text-sm">{scheduledHours}h</div>
        </div>
      </div>

      {/* Gauge bar */}
      <div className="relative">
        <div className="h-3 rounded-full overflow-hidden bg-muted flex">
          <div className="h-full bg-destructive/30" style={{ width: `${minPct}%` }} />
          <div className="h-full bg-accent/30" style={{ width: `${targetPct - minPct}%` }} />
          <div className="h-full bg-success/30" style={{ width: `${100 - targetPct}%` }} />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-foreground shadow-sm"
          style={{ left: `${ppdPct}%` }}
        />
        <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground font-mono">
          <span>0</span>
          <span
            className="absolute text-destructive font-semibold"
            style={{ left: `${minPct}%`, transform: "translateX(-50%)" }}
          >
            {PPD_MINIMUM} min
          </span>
          <span
            className="absolute text-accent font-semibold"
            style={{ left: `${targetPct}%`, transform: "translateX(-50%)" }}
          >
            {PPD_TARGET} target
          </span>
          <span style={{ marginLeft: "auto" }}>{GAUGE_MAX}+</span>
        </div>
      </div>
    </div>
  );
}

// ── KPI Chip ───────────────────────────────────────────────────────────────────

function KpiCard({
  icon, label, value, sub, tone,
}: { icon: React.ReactNode; label: string; value: string; sub: string; tone?: "warn" | "danger" }) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4 flex flex-col gap-1",
      tone === "danger" ? "border-destructive/30" : tone === "warn" ? "border-accent/30" : "border-border",
    )}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn(
        "font-mono text-xl font-semibold tabular-nums",
        tone === "danger" ? "text-destructive" : tone === "warn" ? "text-accent" : "text-foreground",
      )}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
