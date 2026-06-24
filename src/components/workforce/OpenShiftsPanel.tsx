import { useState } from "react";
import { type OpenShift, type CalloutRecord, type NotifResponse, type ShiftPeriod } from "@/lib/mock/workforce";
import { getTopPicks } from "@/lib/workforceUtils";
import { cn } from "@/lib/utils";
import { Check, Clock, X, PhoneCall, Building2, UserPlus, Star } from "lucide-react";

function relativeTime(isoStr: string): string {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const days = Math.floor(diff / 86400);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

const REASON_LABELS: Record<OpenShift["reason"], string> = {
  callout: "Callout",
  unfilled: "Unfilled",
  census_increase: "Census ↑",
};

const REASON_COLORS: Record<OpenShift["reason"], string> = {
  callout: "bg-destructive/10 text-destructive",
  unfilled: "bg-accent/10 text-accent",
  census_increase: "bg-primary/10 text-primary",
};

const PERIOD_DOT: Record<string, string> = {
  Day:     "bg-amber-400",
  Evening: "bg-orange-400",
  Night:   "bg-indigo-400",
};

interface Props {
  openShifts: OpenShift[];
  callouts: CalloutRecord[];
  onFillShift?: (openShiftId: string, staffId: string) => void;
  onMarkResponse?: (openShiftId: string, staffId: string, response: NotifResponse) => void;
  onNotifyStaff?: (openShiftId: string, staffIds: string[], names: string[]) => void;
  assignedShifts?: Map<string, ShiftPeriod>;
}

export function OpenShiftsPanel({ openShifts, callouts, onFillShift, onMarkResponse, onNotifyStaff, assignedShifts }: Props) {
  const uncoveredCallouts = callouts.filter((c) => !c.covered);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
          Open Shifts ({openShifts.length})
        </div>
        <div className="flex flex-col gap-3">
          {openShifts.map((shift) => (
            <OpenShiftCard
              key={shift.id}
              shift={shift}
              assignedShifts={assignedShifts}
              onFillShift={onFillShift ? (staffId) => onFillShift(shift.id, staffId) : undefined}
              onMarkResponse={onMarkResponse ? (staffId, resp) => onMarkResponse(shift.id, staffId, resp) : undefined}
              onNotify={onNotifyStaff ? (ids, names) => onNotifyStaff(shift.id, ids, names) : undefined}
            />
          ))}
          {openShifts.length === 0 && (
            <div className="rounded-lg border border-border bg-card px-4 py-6 text-center">
              <div className="text-sm font-medium text-success">All shifts covered</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">No open slots today</div>
            </div>
          )}
        </div>
      </div>

      {uncoveredCallouts.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
            Uncovered Callouts
          </div>
          <div className="flex flex-col gap-2">
            {uncoveredCallouts.map((c) => (
              <div key={c.id} className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-destructive">{c.staffName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{c.role}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {c.period} · {c.unit} · reported {c.reportedAt}
                </div>
                <div className="text-[11px] text-muted-foreground">{c.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OpenShiftCard({
  shift,
  assignedShifts,
  onFillShift,
  onMarkResponse,
  onNotify,
}: {
  shift: OpenShift;
  assignedShifts?: Map<string, ShiftPeriod>;
  onFillShift?: (staffId: string) => void;
  onMarkResponse?: (staffId: string, response: NotifResponse) => void;
  onNotify?: (staffIds: string[], names: string[]) => void;
}) {
  const [notifying, setNotifying] = useState(false);
  const [justNotified, setJustNotified] = useState(false);

  const topPicks = getTopPicks(shift.role, shift.period, 3, assignedShifts);
  const acceptedCount = shift.notified.filter((n) => n.response === "accepted").length;
  const pending = shift.notified.filter((n) => n.response === "no_response").length;

  // Staff not yet notified from top picks
  const notifiedIds = new Set(shift.notified.map((n) => n.staffId));
  const unnotifiedPicks = topPicks.filter((e) => !notifiedIds.has(e.staff.id));

  function handleNotify() {
    if (notifying || justNotified || unnotifiedPicks.length === 0) return;
    setNotifying(true);
    setTimeout(() => {
      setNotifying(false);
      setJustNotified(true);
      onNotify?.(
        unnotifiedPicks.map((e) => e.staff.id),
        unnotifiedPicks.map((e) => e.staff.name),
      );
      setTimeout(() => setJustNotified(false), 2500);
    }, 700);
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border/60">
        <span className={cn("size-2 rounded-full shrink-0", PERIOD_DOT[shift.period])} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{shift.role} — {shift.unit}</div>
          <div className="text-[11px] text-muted-foreground">{shift.period} · opened {relativeTime(shift.openedAt)}</div>
        </div>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", REASON_COLORS[shift.reason])}>
          {REASON_LABELS[shift.reason]}
        </span>
      </div>

      {/* Top suggested staff */}
      {topPicks.length > 0 && acceptedCount === 0 && (
        <div className="px-3 py-2.5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
            <Star size={9} className="text-[#818CF8]" />
            Suggested
          </div>
          <div className="flex flex-col gap-1.5">
            {topPicks.map((e) => {
              const hoursLeft = e.staff.overtimeThreshold - e.staff.hoursThisWeek;
              return (
                <div key={e.staff.id} className="flex items-center gap-2">
                  <span className="text-xs text-foreground/80 flex-1 truncate">{e.staff.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{hoursLeft}h avail</span>
                  {onFillShift && (
                    <button
                      onClick={() => onFillShift(e.staff.id)}
                      className="shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-white"
                      style={{ backgroundColor: "#818CF8" }}
                    >
                      <UserPlus size={9} />
                      Assign
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notification audit trail */}
      <div className="px-3 py-2">
        <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
          Notified ({shift.notified.length})
        </div>
        <div className="flex flex-col gap-1.5">
          {shift.notified.map((n) => (
            <NotifRow
              key={n.staffId}
              name={n.name}
              response={n.response}
              onAccept={onMarkResponse && n.response === "no_response" ? () => onMarkResponse(n.staffId, "accepted") : undefined}
              onDecline={onMarkResponse && n.response === "no_response" ? () => onMarkResponse(n.staffId, "declined") : undefined}
            />
          ))}
        </div>
        {shift.notified.length === 0 && (
          <div className="text-[11px] text-muted-foreground">No notifications sent yet.</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-3 pb-3">
        {acceptedCount > 0 ? (
          <span className="text-[11px] text-success flex items-center gap-1">
            <Check size={11} /> Covered — pending confirmation
          </span>
        ) : (
          <>
            <button
              onClick={handleNotify}
              disabled={notifying || (unnotifiedPicks.length === 0 && pending === 0)}
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-colors",
                justNotified
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {notifying ? (
                <span className="w-3 h-3 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
              ) : justNotified ? (
                <Check size={11} />
              ) : (
                <PhoneCall size={11} />
              )}
              {justNotified
                ? "Sent!"
                : notifying
                  ? "Sending…"
                  : pending > 0
                    ? `Remind (${pending})`
                    : unnotifiedPicks.length > 0
                      ? `Notify ${unnotifiedPicks.length}`
                      : "Notify Staff"}
            </button>
            <button className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-accent/40 text-accent hover:bg-accent/10 transition-colors">
              <Building2 size={11} />
              Use Agency
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function NotifRow({
  name,
  response,
  onAccept,
  onDecline,
}: {
  name: string;
  response: NotifResponse;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const configs = {
    accepted:    { icon: <Check size={11} />, color: "text-success",            label: "Accepted"    },
    declined:    { icon: <X    size={11} />, color: "text-destructive",         label: "Declined"    },
    no_response: { icon: <Clock size={11} />, color: "text-muted-foreground",   label: "No response" },
  };
  const cfg = configs[response];

  return (
    <div className="flex items-center gap-2">
      <span className={cn("shrink-0", cfg.color)}>{cfg.icon}</span>
      <span className="text-xs text-foreground/80 flex-1 truncate">{name}</span>
      {response === "no_response" && onAccept && onDecline ? (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onAccept}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
          >
            <Check size={9} /> Accept
          </button>
          <button
            onClick={onDecline}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <X size={9} /> Decline
          </button>
        </div>
      ) : (
        <span className={cn("text-[10px] font-medium shrink-0", cfg.color)}>{cfg.label}</span>
      )}
    </div>
  );
}
