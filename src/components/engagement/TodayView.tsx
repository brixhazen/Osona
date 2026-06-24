import { useState } from "react";
import {
  TODAY_ACTIVITIES, RESIDENT_PROFILES, DOMAIN_CONFIG, QUALITY_CONFIG,
  type ActivityEvent, type AttendanceRecord, type EngagementQuality,
} from "@/lib/mock/engagement";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertTriangle, Bell, ClipboardList, Users, ChevronRight, Phone } from "lucide-react";

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatTodayLabel(): string {
  const d = new Date();
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function TodayView() {
  const [attendanceActivity, setAttendanceActivity] = useState<ActivityEvent | null>(null);

  const critical = RESIDENT_PROFILES.filter((r) => r.riskLevel === "critical");
  const atRisk = RESIDENT_PROFILES.filter((r) => r.riskLevel === "at_risk");

  return (
    <>
      <div className="flex gap-5 items-start">
        {/* Activity timeline */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Today's Schedule — {formatTodayLabel()} · {TODAY_ACTIVITIES.length} programs
          </div>
          {TODAY_ACTIVITIES.map((act) => (
            <ActivityCard key={act.id} activity={act} onTakeAttendance={() => setAttendanceActivity(act)} />
          ))}
        </div>

        {/* At-risk sidebar */}
        <div className="w-[300px] shrink-0 flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Engagement Alerts
          </div>

          {critical.map((r) => (
            <AtRiskCard key={r.id} profile={r} severity="critical" />
          ))}
          {atRisk.map((r) => (
            <AtRiskCard key={r.id} profile={r} severity="at_risk" />
          ))}

          {/* Publish reminder */}
          <div className="rounded-lg border border-border bg-card p-3 mt-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Calendar Distribution</div>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "Print PDF", done: true },
                { label: "Family Portal", done: true },
                { label: "Digital Signage", done: true },
                { label: "Community TV", done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle size={11} className={item.done ? "text-success" : "text-muted-foreground"} />
                  <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full text-xs px-2.5 py-1.5 rounded border border-border hover:bg-secondary transition-colors">
              Publish to All Channels
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Sheet */}
      <Sheet open={attendanceActivity !== null} onOpenChange={(o) => !o && setAttendanceActivity(null)}>
        <SheetContent className="w-[440px] sm:max-w-lg bg-card border-l border-border overflow-y-auto">
          {attendanceActivity && <AttendanceSheet activity={attendanceActivity} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ActivityCard({ activity: act, onTakeAttendance }: { activity: ActivityEvent; onTakeAttendance: () => void }) {
  const domainCfg = DOMAIN_CONFIG[act.domain];
  const isCompleted = act.status === "completed";
  const isInProgress = act.status === "in_progress";
  const isUpcoming = act.status === "upcoming";

  const qualityCounts = act.attendanceRecords.reduce((acc, r) => {
    acc[r.quality] = (acc[r.quality] || 0) + 1;
    return acc;
  }, {} as Record<EngagementQuality, number>);

  const familyNotified = act.attendanceRecords.filter((r) => r.familyNotified).length;

  return (
    <div className={cn(
      "rounded-lg border bg-card overflow-hidden",
      isInProgress ? "border-primary/40 shadow-sm" : "border-border",
      isUpcoming && "opacity-70",
    )}>
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Domain color indicator */}
        <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: domainCfg.hex }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{act.title}</span>
            {act.recurring && (
              <span className="text-[9px] text-muted-foreground border border-border/60 px-1.5 py-0.5 rounded">
                {act.recurringPattern}
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {act.time} · {act.durationMin} min · {act.location} · {act.leadStaff}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 shrink-0">
          {isCompleted && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-[11px] text-success">
                <CheckCircle size={11} />
                <span>{act.totalAttended}/{act.expectedCount} attended</span>
              </div>
              {familyNotified > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                  <Bell size={9} />
                  <span>{familyNotified} families notified</span>
                </div>
              )}
            </div>
          )}
          {isInProgress && (
            <button
              onClick={onTakeAttendance}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              <ClipboardList size={12} />
              Take Attendance
            </button>
          )}
          {isUpcoming && (
            <div className="text-right text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>{act.expectedCount} expected</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quality bar for completed activities */}
      {isCompleted && act.attendanceRecords.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-1.5">
            {(["excellent", "good", "fair", "refused", "slept"] as EngagementQuality[]).map((q) => {
              const count = qualityCounts[q] || 0;
              if (count === 0) return null;
              const pct = (count / act.attendanceRecords.length) * 100;
              const colors: Record<EngagementQuality, string> = {
                excellent: "bg-success", good: "bg-primary", fair: "bg-accent",
                refused: "bg-destructive", slept: "bg-muted-foreground",
              };
              return <div key={q} className={cn("h-full", colors[q])} style={{ width: `${pct}%` }} />;
            })}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {(["excellent", "good", "fair", "refused", "slept"] as EngagementQuality[]).map((q) => {
              const count = qualityCounts[q] || 0;
              if (count === 0) return null;
              return (
                <span key={q} className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", QUALITY_CONFIG[q].cls)}>
                  {QUALITY_CONFIG[q].label} {count}
                </span>
              );
            })}
          </div>

          {/* Key notes */}
          {act.attendanceRecords.filter((r) => r.notes).map((r) => (
            <div key={r.residentId} className="mt-1.5 text-[11px] text-muted-foreground border-l-2 border-border pl-2">
              <span className="font-medium text-foreground/80">{r.residentName}:</span> {r.notes}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AtRiskCard({ profile, severity }: { profile: typeof RESIDENT_PROFILES[number]; severity: "critical" | "at_risk" }) {
  const isCritical = severity === "critical";
  const [teamNotified, setTeamNotified] = useState(false);
  const [familyContacted, setFamilyContacted] = useState(false);

  return (
    <div className={cn(
      "rounded-lg border p-3",
      isCritical ? "border-destructive/40 bg-destructive/5" : "border-accent/30 bg-accent/5",
    )}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={12} className={isCritical ? "text-destructive" : "text-accent"} />
        <span className={cn("text-xs font-medium", isCritical ? "text-destructive" : "text-accent")}>
          {isCritical ? "Critical" : "At Risk"}
        </span>
        <span className="text-xs text-foreground ml-auto">{profile.name}</span>
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">Engagement Score</span>
        <span className={cn("font-mono text-sm font-semibold", isCritical ? "text-destructive" : "text-accent")}>
          {profile.engagementScore}/100
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
        <div
          className={cn("h-full rounded-full", isCritical ? "bg-destructive" : "bg-accent")}
          style={{ width: `${profile.engagementScore}%` }}
        />
      </div>
      <div className="flex flex-col gap-0.5">
        {profile.alerts.slice(0, 2).map((alert, i) => (
          <div key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
            <span className="shrink-0 mt-0.5">·</span>
            {alert}
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-2">
        <button
          onClick={() => setTeamNotified(true)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors",
            teamNotified
              ? "border-success/40 bg-success/10 text-success"
              : "border-border hover:bg-secondary",
          )}
        >
          {teamNotified ? <><CheckCircle size={9} /> Team Notified</> : "Notify Care Team"}
        </button>
        <button
          onClick={() => setFamilyContacted(true)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors",
            familyContacted
              ? "border-success/40 bg-success/10 text-success"
              : "border-border hover:bg-secondary",
          )}
        >
          {familyContacted ? <><CheckCircle size={9} /> Family Contacted</> : <><Phone size={9} /> Contact Family</>}
        </button>
      </div>
    </div>
  );
}

function AttendanceSheet({ activity }: { activity: ActivityEvent }) {
  const domainCfg = DOMAIN_CONFIG[activity.domain];
  const qualities: EngagementQuality[] = ["excellent", "good", "fair", "refused", "slept"];

  // Mock resident list for taking attendance (use our named profiles + fill with placeholders)
  const mockResidents = [
    "Eleanor Bradford", "Raymond Kowalski", "Beverly Stone",
    "Howard Ingram", "Dorothy Chen", "Frank Nguyen", "Rose Martinez",
    "Arthur Williams", "Helen Cooper", "James Sullivan",
  ].slice(0, activity.expectedCount);

  return (
    <>
      <SheetHeader className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-2 rounded-full" style={{ backgroundColor: domainCfg.hex }} />
          <SheetTitle>{activity.title}</SheetTitle>
        </div>
        <SheetDescription>
          {activity.time} · {activity.location} · {activity.expectedCount} expected
        </SheetDescription>
      </SheetHeader>

      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
        Quality of Engagement
      </div>

      <div className="flex flex-col gap-2">
        {mockResidents.map((name) => (
          <div key={name} className="flex items-center gap-2 py-2 border-b border-border/50 last:border-0">
            <div className="size-7 rounded-full bg-secondary grid place-items-center text-[10px] font-medium shrink-0">
              {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <span className="text-sm flex-1">{name}</span>
            <div className="flex items-center gap-1">
              {qualities.map((q) => (
                <button
                  key={q}
                  title={QUALITY_CONFIG[q].label}
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded border font-medium transition-colors",
                    QUALITY_CONFIG[q].cls,
                    "opacity-50 hover:opacity-100",
                  )}
                >
                  {QUALITY_CONFIG[q].label.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="flex-1 text-sm px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
          Save & Notify Families
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Families will receive an automated notification for each attended resident.
      </p>
    </>
  );
}
