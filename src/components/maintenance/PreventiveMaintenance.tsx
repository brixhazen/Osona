import { useState } from "react";
import {
  CATEGORY_CONFIG, type PMTask, type PMStatus,
} from "@/lib/mock/maintenance";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, Shield, Wrench } from "lucide-react";

type StatusFilter = "all" | PMStatus;

interface Props {
  pmTasks: PMTask[];
  onMarkComplete: (id: string) => void;
}

export function PreventiveMaintenance({ pmTasks, onMarkComplete }: Props) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const overdueCt = pmTasks.filter((t) => t.status === "overdue").length;
  const dueSoonCt = pmTasks.filter((t) => t.status === "due_soon").length;
  const currentCt = pmTasks.filter((t) => t.status === "current").length;

  const sorted = [...pmTasks].sort((a, b) => {
    const order: Record<PMStatus, number> = { overdue: 0, due_soon: 1, current: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const visible = sorted.filter((t) => filter === "all" || t.status === filter);

  // Build due-this-month map from live pmTasks
  const dueThisMonth: Record<number, string[]> = {};
  pmTasks.forEach((t) => {
    if (t.nextDue.startsWith("2026-06")) {
      const day = parseInt(t.nextDue.slice(8));
      if (!dueThisMonth[day]) dueThisMonth[day] = [];
      dueThisMonth[day].push(t.title);
    }
  });

  return (
    <div className="flex gap-5 items-start">
      {/* Left: PM task list */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {([
            { id: "all",      label: "All Tasks",  count: pmTasks.length },
            { id: "overdue",  label: "Overdue",    count: overdueCt },
            { id: "due_soon", label: "Due Soon",   count: dueSoonCt },
            { id: "current",  label: "Current",    count: currentCt },
          ] as { id: StatusFilter; label: string; count: number }[]).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="ml-1.5 font-mono opacity-60">{f.count}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {visible.map((task) => {
            const isOverdue = task.status === "overdue";
            const isDueSoon = task.status === "due_soon";
            const isCurrent = task.status === "current";

            return (
              <div
                key={task.id}
                className={cn(
                  "rounded-lg border p-4",
                  isCurrent ? "border-success/30 bg-success/5"
                  : isOverdue ? "border-destructive/30 bg-destructive/5"
                  : isDueSoon ? "border-accent/25 bg-accent/5"
                  : "border-border bg-card",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "size-8 rounded-md flex items-center justify-center shrink-0",
                    isCurrent ? "bg-success/15 text-success"
                    : isOverdue ? "bg-destructive/15 text-destructive"
                    : isDueSoon ? "bg-accent/15 text-accent"
                    : "bg-secondary text-muted-foreground",
                  )}>
                    {isCurrent ? <CheckCircle size={14} />
                    : isOverdue ? <AlertTriangle size={14} />
                    : isDueSoon ? <Clock size={14} />
                    : <Wrench size={14} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{task.title}</span>
                      {task.regulatoryRequired && (
                        <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded border border-primary/20 bg-primary/8 text-primary font-medium">
                          <Shield size={8} />
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{CATEGORY_CONFIG[task.category as keyof typeof CATEGORY_CONFIG]?.label ?? task.category}</span>
                      <span>Every {task.frequency}</span>
                      <span>{task.estimatedHours}h est.</span>
                      <span>→ {task.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px]">
                      <span className="text-muted-foreground">Last: {task.lastCompleted}</span>
                      <span className={cn(
                        "font-medium",
                        isOverdue ? "text-destructive" : isDueSoon ? "text-accent" : "text-muted-foreground",
                      )}>
                        {isOverdue
                          ? `Overdue ${Math.abs(task.daysUntilDue)} day${Math.abs(task.daysUntilDue) !== 1 ? "s" : ""}`
                          : isDueSoon
                          ? `Due in ${task.daysUntilDue} day${task.daysUntilDue !== 1 ? "s" : ""}`
                          : `Next: ${task.nextDue}`}
                      </span>
                    </div>
                    {task.notes && (
                      <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{task.notes}</div>
                    )}
                  </div>

                  {isCurrent ? (
                    <div className="flex items-center gap-1.5 text-xs text-success font-medium shrink-0">
                      <CheckCircle size={11} />
                      Done
                    </div>
                  ) : (
                    <button
                      onClick={() => onMarkComplete(task.id)}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      <CheckCircle size={11} />
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: calendar + summary */}
      <div className="w-[240px] shrink-0 flex flex-col gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5">June 2026</div>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Overdue",  value: overdueCt,      cls: "text-destructive" },
              { label: "Due Soon", value: dueSoonCt,      cls: "text-accent" },
              { label: "Current",  value: currentCt,      cls: "text-success" },
              { label: "Total",    value: pmTasks.length, cls: "text-foreground" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={cn("font-mono font-semibold", row.cls)}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini calendar — June 2026 starts Monday (offset 1) */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Upcoming Due Dates</div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-[8px] text-muted-foreground py-0.5 font-medium">{d}</div>
            ))}
            {/* June 2026 starts on Monday — offset 1 */}
            <div />
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
              const isToday = day === 5;
              const hasDue = dueThisMonth[day];
              const isPast = day < 5;

              return (
                <div
                  key={day}
                  title={hasDue ? hasDue.join(", ") : undefined}
                  className={cn(
                    "rounded text-[9px] py-0.5 font-mono relative",
                    isToday ? "bg-primary text-primary-foreground font-bold"
                    : hasDue ? "bg-accent/20 text-accent font-semibold"
                    : isPast ? "text-muted-foreground/40"
                    : "text-foreground/70",
                  )}
                >
                  {day}
                  {hasDue && !isToday && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-0.5 rounded-full bg-accent" />
                  )}
                </div>
              );
            })}
          </div>
          {Object.keys(dueThisMonth).length > 0 && (
            <div className="mt-2.5 flex flex-col gap-1">
              {Object.entries(dueThisMonth)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([day, tasks]) => (
                  <div key={day} className="text-[10px] flex gap-1.5">
                    <span className="text-accent font-mono w-6 shrink-0">Jun {day}</span>
                    <span className="text-muted-foreground">{tasks.join(", ")}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[10px]">
          <div className="flex items-center gap-1 text-primary font-semibold mb-1">
            <Shield size={10} />
            Regulatory Required
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {pmTasks.filter((t) => t.regulatoryRequired).length} of {pmTasks.length} PM tasks are required for state licensure or health department compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
