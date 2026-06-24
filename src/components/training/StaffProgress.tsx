import { useState } from "react";
import {
  COURSES, DEPT_CONFIG, COURSE_STATUS_CONFIG,
  getStaffCompletionPct, getStaffOverdueCount,
  type StaffMember, type Department,
} from "@/lib/mock/training";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, Clock, X, Plus,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

type DeptFilter = "all" | Department;
type StatusFilter = "all" | "overdue" | "on_track" | "new_hire";

interface Props {
  staff: StaffMember[];
  onMarkCourseComplete: (staffId: string, courseId: string) => void;
  onLogHours: (staffId: string, hours: number) => void;
}

export function StaffProgress({ staff, onMarkCourseComplete, onLogHours }: Props) {
  const [dept, setDept] = useState<DeptFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = staff.find((s) => s.id === selectedId) ?? null;

  const sorted = staff
    .filter((s) => {
      if (dept !== "all" && s.department !== dept) return false;
      if (status === "overdue" && getStaffOverdueCount(s) === 0) return false;
      if (status === "on_track" && (getStaffOverdueCount(s) > 0 || s.isNewHire)) return false;
      if (status === "new_hire" && !s.isNewHire) return false;
      return true;
    })
    .sort((a, b) => {
      const aScore = getStaffOverdueCount(a) * 100 - getStaffCompletionPct(a);
      const bScore = getStaffOverdueCount(b) * 100 - getStaffCompletionPct(b);
      return bScore - aScore;
    });

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            {(["all", "overdue", "on_track", "new_hire"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                  status === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {s === "all" ? "All Staff" : s === "overdue" ? "Has Overdue" : s === "on_track" ? "On Track" : "New Hire"}
                <span className="ml-1.5 font-mono opacity-60">
                  {s === "all" ? staff.length
                  : s === "overdue" ? staff.filter((st) => getStaffOverdueCount(st) > 0).length
                  : s === "on_track" ? staff.filter((st) => getStaffOverdueCount(st) === 0 && !st.isNewHire).length
                  : staff.filter((st) => st.isNewHire).length}
                </span>
              </button>
            ))}
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            {(["all", "nursing", "dietary", "activities", "maintenance", "administration"] as DeptFilter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                  dept === d
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {d === "all" ? "All Depts" : DEPT_CONFIG[d].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {sorted.map((s) => (
            <StaffCard key={s.id} staff={s} onSelect={() => setSelectedId(s.id)} />
          ))}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-[520px] bg-card border-l border-border overflow-y-auto p-0">
          {selected && (
            <StaffDetail
              staff={selected}
              onClose={() => setSelectedId(null)}
              onMarkCourseComplete={(courseId) => onMarkCourseComplete(selected.id, courseId)}
              onLogHours={(hours) => onLogHours(selected.id, hours)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function StaffCard({ staff: s, onSelect }: { staff: StaffMember; onSelect: () => void }) {
  const pct = getStaffCompletionPct(s);
  const overdue = getStaffOverdueCount(s);
  const deptCfg = DEPT_CONFIG[s.department];
  const hoursRemaining = Math.max(0, s.inServiceHoursRequired - s.inServiceHoursYTD);
  const hoursPct = Math.min(100, (s.inServiceHoursYTD / s.inServiceHoursRequired) * 100);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "text-left rounded-lg border bg-card p-4 flex flex-col gap-3 transition-colors hover:bg-secondary/20",
        overdue > 0 ? "border-destructive/25 bg-destructive/3"
        : s.isNewHire ? "border-primary/20 bg-primary/3"
        : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "size-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
            overdue > 0 ? "bg-destructive/15 text-destructive"
            : s.isNewHire ? "bg-primary/15 text-primary"
            : "bg-secondary text-muted-foreground",
          )}>
            {s.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div className="text-sm font-semibold">{s.name}</div>
            <div className="text-[10px] text-muted-foreground">{s.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {s.isNewHire && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-primary/20 bg-primary/8 text-primary font-medium">
              New Hire
            </span>
          )}
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", deptCfg.color)}>
            {deptCfg.label}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">Course Completion</span>
          <span className={cn("font-mono font-semibold", overdue > 0 ? "text-destructive" : pct >= 80 ? "text-success" : "text-accent")}>
            {pct}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full", overdue > 0 ? "bg-destructive/70" : pct >= 80 ? "bg-success/70" : "bg-accent/70")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-[10px]">
        {overdue > 0 ? (
          <span className="flex items-center gap-1 text-destructive font-medium">
            <AlertTriangle size={9} />
            {overdue} overdue
          </span>
        ) : (
          <span className="flex items-center gap-1 text-success">
            <CheckCircle size={9} />
            On track
          </span>
        )}
        <span className="text-muted-foreground">
          {s.inServiceHoursYTD}h / {s.inServiceHoursRequired}h in-service
        </span>
        {hoursRemaining > 0 && (
          <span className="text-muted-foreground ml-auto">{hoursRemaining}h remaining</span>
        )}
      </div>

      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full", hoursPct >= 100 ? "bg-success/60" : "bg-primary/50")}
          style={{ width: `${hoursPct}%` }}
        />
      </div>
    </button>
  );
}

function StaffDetail({
  staff: s, onClose, onMarkCourseComplete, onLogHours,
}: {
  staff: StaffMember;
  onClose: () => void;
  onMarkCourseComplete: (courseId: string) => void;
  onLogHours: (hours: number) => void;
}) {
  const pct = getStaffCompletionPct(s);
  const overdue = getStaffOverdueCount(s);
  const deptCfg = DEPT_CONFIG[s.department];

  const courseMap = new Map(COURSES.map((c) => [c.id, c]));
  const overdueCourses = s.courses.filter((c) => c.status === "overdue");
  const inProgress = s.courses.filter((c) => c.status === "in_progress");
  const completed = s.courses.filter((c) => c.status === "completed");
  const notStarted = s.courses.filter((c) => c.status === "not_started");

  const [loggingHours, setLoggingHours] = useState(false);
  const [hoursInput, setHoursInput] = useState("");

  function handleLogHours(e: React.FormEvent) {
    e.preventDefault();
    const hrs = parseFloat(hoursInput);
    if (!isNaN(hrs) && hrs > 0) {
      onLogHours(hrs);
      setHoursInput("");
      setLoggingHours(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "size-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              overdue > 0 ? "bg-destructive/15 text-destructive"
              : s.isNewHire ? "bg-primary/15 text-primary"
              : "bg-secondary text-muted-foreground",
            )}>
              {s.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base font-semibold">{s.name}</SheetTitle>
                {s.isNewHire && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-primary/20 bg-primary/8 text-primary font-medium">
                    New Hire
                  </span>
                )}
              </div>
              <SheetDescription className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground">{s.role}</span>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", deptCfg.color)}>
                  {deptCfg.label}
                </span>
              </SheetDescription>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground shrink-0">
            <X size={14} />
          </button>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatBox label="Completion" value={`${pct}%`} cls={overdue > 0 ? "text-destructive" : pct >= 80 ? "text-success" : "text-accent"} />
          <StatBox label="In-Service YTD" value={`${s.inServiceHoursYTD}h`} cls={s.inServiceHoursYTD >= s.inServiceHoursRequired ? "text-success" : "text-accent"} />
          <StatBox label="Hire Date" value={s.hireDate.slice(0, 7)} cls="text-foreground" />
        </div>

        {/* In-service hours bar + log */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">In-Service Hours YTD</div>
            {!loggingHours && (
              <button
                onClick={() => setLoggingHours(true)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-border rounded px-1.5 py-0.5 transition-colors"
              >
                <Plus size={9} />
                Log Hours
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full", s.inServiceHoursYTD >= s.inServiceHoursRequired ? "bg-success/70" : "bg-primary/60")}
                style={{ width: `${Math.min(100, (s.inServiceHoursYTD / s.inServiceHoursRequired) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-mono shrink-0">
              {s.inServiceHoursYTD} / {s.inServiceHoursRequired}h
            </span>
          </div>
          {loggingHours && (
            <form onSubmit={handleLogHours} className="flex items-center gap-2 mt-1.5">
              <div className="flex gap-1">
                {[0.5, 1.0, 2.0].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHoursInput(String(h))}
                    className={cn(
                      "h-7 px-2 rounded border text-[10px] font-mono transition-colors",
                      hoursInput === String(h)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    +{h}h
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
                placeholder="hrs"
                className="w-16 h-7 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="h-7 px-2.5 rounded bg-primary text-primary-foreground text-[10px] font-medium hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => { setLoggingHours(false); setHoursInput(""); }}
                className="h-7 px-2 rounded border border-border text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </form>
          )}
        </div>

        {/* Overdue */}
        {overdueCourses.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-destructive mb-1.5 flex items-center gap-1">
              <AlertTriangle size={9} />
              Overdue ({overdueCourses.length})
            </div>
            <div className="flex flex-col gap-1.5">
              {overdueCourses.map((cp) => {
                const course = courseMap.get(cp.courseId);
                if (!course) return null;
                return (
                  <div key={cp.courseId} className="flex items-center gap-2 px-2.5 py-2 rounded-md border border-destructive/20 bg-destructive/5 text-xs">
                    <AlertTriangle size={11} className="text-destructive shrink-0" />
                    <span className="flex-1">{course.title}</span>
                    <span className="text-destructive font-mono text-[10px]">Due {cp.dueDate}</span>
                    <button
                      onClick={() => onMarkCourseComplete(cp.courseId)}
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-success/30 text-success hover:bg-success/10 transition-colors shrink-0"
                    >
                      <CheckCircle size={9} />
                      Complete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* In progress */}
        {inProgress.length > 0 && (
          <div>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              <Clock size={9} className="text-primary" />
              In Progress ({inProgress.length})
            </div>
            <div className="flex flex-col gap-1">
              {inProgress.map((cp) => {
                const course = courseMap.get(cp.courseId);
                if (!course) return null;
                return (
                  <div key={cp.courseId} className="flex items-center gap-2 text-[11px] px-2 py-1.5 rounded border border-border/50 bg-secondary/20">
                    <span className="flex-1 text-foreground/80">{course.title}</span>
                    {cp.dueDate && (
                      <span className="text-muted-foreground font-mono text-[10px]">Due {cp.dueDate}</span>
                    )}
                    <button
                      onClick={() => onMarkCourseComplete(cp.courseId)}
                      className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-success/30 text-success hover:bg-success/10 transition-colors shrink-0"
                    >
                      <CheckCircle size={9} />
                      Complete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <CourseSection label={`Completed (${completed.length})`} courses={completed} courseMap={courseMap} icon={<CheckCircle size={9} className="text-success" />} />
        )}

        {/* Not started */}
        {notStarted.length > 0 && (
          <CourseSection label={`Not Started (${notStarted.length})`} courses={notStarted} courseMap={courseMap} icon={<Clock size={9} className="text-muted-foreground" />} />
        )}

        {/* Certifications */}
        {s.certifications.length > 0 && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Certifications</div>
            <div className="flex flex-col gap-1.5">
              {s.certifications.map((cert, i) => {
                const isExpired = cert.status === "expired";
                const isExpiringSoon = cert.status === "expiring_soon";
                return (
                  <div key={i} className={cn(
                    "flex items-center gap-2 px-2.5 py-2 rounded-md border text-xs",
                    isExpired ? "border-destructive/20 bg-destructive/5"
                    : isExpiringSoon ? "border-accent/20 bg-accent/5"
                    : "border-border bg-secondary/30",
                  )}>
                    <span className="flex-1 font-medium">{cert.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                    <span className={cn(
                      "text-[10px] font-medium",
                      isExpired ? "text-destructive" : isExpiringSoon ? "text-accent" : "text-muted-foreground",
                    )}>
                      {isExpired ? "Expired" : `Exp. ${cert.expiryDate.slice(0, 7)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-2.5 text-center">
      <div className={cn("font-display font-bold text-lg", cls)}>{value}</div>
      <div className="text-[9px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function CourseSection({
  label, courses, courseMap, icon,
}: {
  label: string;
  courses: { courseId: string; status: string; completedDate: string | null; score: number | null; dueDate: string | null }[];
  courseMap: Map<string, { title: string; durationHours: number }>;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
        {icon}
        {label}
      </div>
      <div className="flex flex-col gap-1">
        {courses.map((cp) => {
          const course = courseMap.get(cp.courseId);
          if (!course) return null;
          return (
            <div key={cp.courseId} className="flex items-center gap-2 text-[11px] px-2 py-1.5 rounded border border-border/50 bg-secondary/20">
              <span className="flex-1 text-foreground/80">{course.title}</span>
              {cp.completedDate && (
                <span className="text-muted-foreground">{cp.completedDate}</span>
              )}
              {cp.score !== null && (
                <span className="font-mono text-success">{cp.score}%</span>
              )}
              {cp.dueDate && !cp.completedDate && (
                <span className="text-muted-foreground font-mono text-[10px]">Due {cp.dueDate}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
