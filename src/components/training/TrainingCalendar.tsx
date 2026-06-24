import { useState } from "react";
import {
  COURSES, DEPT_CONFIG,
  type TrainingSession, type SessionStatus,
} from "@/lib/mock/training";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle, Clock, MapPin, Shield, Users } from "lucide-react";

type StatusFilter = "all" | SessionStatus;

const SESSION_STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; dot: string }> = {
  upcoming:    { label: "Upcoming",    color: "bg-primary/10 text-primary border-primary/20",    dot: "bg-primary" },
  in_progress: { label: "In Progress", color: "bg-accent/10 text-accent border-accent/20",        dot: "bg-accent" },
  completed:   { label: "Completed",   color: "bg-success/10 text-success border-success/20",     dot: "bg-success" },
};

interface Props {
  sessions: TrainingSession[];
  onEnroll: (sessionId: string) => void;
  onUnenroll: (sessionId: string) => void;
}

export function TrainingCalendar({ sessions, onEnroll, onUnenroll }: Props) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [userEnrolled, setUserEnrolled] = useState<Set<string>>(new Set());

  function toggleEnroll(sessionId: string) {
    const wasEnrolled = userEnrolled.has(sessionId);
    setUserEnrolled((prev) => {
      const next = new Set(prev);
      if (wasEnrolled) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
    if (wasEnrolled) onUnenroll(sessionId);
    else onEnroll(sessionId);
  }

  const visible = sessions.filter((s) => filter === "all" || s.status === filter);
  const upcoming = visible.filter((s) => s.status === "upcoming" || s.status === "in_progress");
  const completed = visible.filter((s) => s.status === "completed");

  return (
    <div className="flex gap-5 items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          {(["all", "upcoming", "completed"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All Sessions" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 font-mono opacity-60">
                {f === "all" ? sessions.length
                : f === "upcoming" ? sessions.filter((s) => s.status === "upcoming" || s.status === "in_progress").length
                : sessions.filter((s) => s.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {upcoming.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Calendar size={10} />
              Upcoming Sessions
            </div>
            {upcoming.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isEnrolled={userEnrolled.has(session.id)}
                onToggleEnroll={() => toggleEnroll(session.id)}
              />
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <CheckCircle size={10} />
              Completed Sessions
            </div>
            {completed.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isEnrolled={false}
                onToggleEnroll={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-[240px] shrink-0 flex flex-col gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">Jun 2026</div>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Upcoming",    value: sessions.filter((s) => s.status === "upcoming").length,  cls: "text-primary" },
              { label: "Completed",   value: sessions.filter((s) => s.status === "completed").length, cls: "text-success" },
              { label: "Mandatory",   value: sessions.filter((s) => s.mandatory).length,              cls: "text-destructive" },
              { label: "Total Hours", value: `${sessions.filter((s) => s.status === "upcoming").reduce((a, s) => a + s.durationHours, 0)}h`, cls: "text-foreground" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn("font-mono font-semibold", row.cls)}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-accent/25 bg-accent/5 p-3 text-[10px]">
          <div className="text-accent font-semibold mb-1 flex items-center gap-1">
            <Shield size={10} />
            Food Handler Safety — Jun 5
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Health Dept. in-service scheduled today in the Kitchen Training Area at 1:00 PM. All dietary staff must attend.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Legend</div>
          <div className="flex flex-col gap-1.5">
            {(Object.entries(SESSION_STATUS_CONFIG) as [SessionStatus, typeof SESSION_STATUS_CONFIG[SessionStatus]][]).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-2 text-[10px]">
                <div className={cn("size-2 rounded-full shrink-0", cfg.dot)} />
                <span className="text-muted-foreground">{cfg.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-[10px] mt-1">
              <Shield size={9} className="text-destructive" />
              <span className="text-muted-foreground">Mandatory attendance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionCard({
  session: s,
  isEnrolled,
  onToggleEnroll,
}: {
  session: TrainingSession;
  isEnrolled: boolean;
  onToggleEnroll: () => void;
}) {
  const statusCfg = SESSION_STATUS_CONFIG[s.status];
  const isCompleted = s.status === "completed";
  const enrollPct = Math.round((s.enrolled / s.capacity) * 100);
  const isFull = s.enrolled >= s.capacity;
  const course = COURSES.find((c) => c.id === s.courseId);
  const deptLabel = s.department === "all" ? "All Staff" : DEPT_CONFIG[s.department]?.label ?? s.department;

  return (
    <div className={cn(
      "rounded-lg border bg-card p-4",
      s.mandatory ? "border-l-4 border-l-primary/40 border-border" : "border-border",
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", statusCfg.color)}>
              {statusCfg.label}
            </span>
            {s.mandatory && (
              <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded border border-destructive/25 bg-destructive/8 text-destructive font-medium">
                <Shield size={8} />
                Mandatory
              </span>
            )}
            <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">
              {deptLabel}
            </span>
          </div>
          <div className="text-sm font-semibold">{s.title}</div>
        </div>
        {!isCompleted && (
          <button
            onClick={onToggleEnroll}
            disabled={!isEnrolled && isFull}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border font-medium transition-colors shrink-0",
              isEnrolled
                ? "border-success/40 bg-success/10 text-success"
                : isFull
                ? "border-border text-muted-foreground/50 cursor-not-allowed"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {isEnrolled ? <CheckCircle size={11} /> : <Users size={11} />}
            {isEnrolled ? "Enrolled" : isFull ? "Full" : "Enroll"}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Calendar size={9} />
          {s.date} · {s.time}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={9} />
          {s.durationHours}h
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={9} />
          {s.location}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[10px]">
        <span className="text-muted-foreground">Instructor: <span className="text-foreground">{s.instructor}</span></span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full", enrollPct >= 80 ? "bg-accent/70" : "bg-primary/60")}
                style={{ width: `${enrollPct}%` }}
              />
            </div>
            <span className={cn("text-muted-foreground", isFull && !isCompleted ? "text-accent font-medium" : "")}>
              {s.enrolled}/{s.capacity}
            </span>
          </div>
        </div>
      </div>

      {course && (
        <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
          Linked course: <span className="text-foreground">{course.title}</span>
        </div>
      )}
    </div>
  );
}
