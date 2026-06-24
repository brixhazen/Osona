import { useState } from "react";
import {
  DIET_CONFIG, ABSENCE_LABELS,
  type MealService, type MealPeriod, type MealAbsence,
} from "@/lib/mock/dining";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, Clock, ClipboardList,
  Utensils, Bell, Download,
} from "lucide-react";

type Tab = "today" | "diets" | "menu" | "weights" | "reports";

const PERIOD_LABELS: Record<MealPeriod, string> = {
  breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner",
};

const MOCK_DINNER_RESIDENTS = [
  "Eleanor Bradford", "Gerald Hayes", "Raymond Kowalski", "Howard Ingram",
  "Dorothy Hayes", "Robert Chen", "Doris Lambert", "Beverly Stone",
  "Frank Nguyen", "Rose Martinez", "Arthur Williams", "Helen Cooper",
];

function downloadAttendanceCSV(meals: MealService[]) {
  const header = ["Period", "Time", "Attended", "Census", "%", "Absent Resident", "Room", "Reason", "Notes"];
  const rows: string[][] = [];
  for (const m of meals) {
    if (m.status !== "completed") continue;
    const pct = m.totalCensus > 0 ? Math.round((m.attended / m.totalCensus) * 100) : 0;
    if (m.absences.length === 0) {
      rows.push([m.period, m.time, String(m.attended), String(m.totalCensus), `${pct}%`, "", "", "", ""]);
    } else {
      for (const a of m.absences) {
        rows.push([m.period, m.time, String(m.attended), String(m.totalCensus), `${pct}%`, a.residentName, a.room, a.reason, a.notes ?? ""]);
      }
    }
  }
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  meals: MealService[];
  onSubmitDinnerAttendance: (markedCount: number) => void;
  onNavigate: (tab: Tab) => void;
}

export function TodayService({ meals, onSubmitDinnerAttendance, onNavigate }: Props) {
  const [attendanceFor, setAttendanceFor] = useState<MealService | null>(null);

  const completedMeals = meals.filter((m) => m.status === "completed");
  const refusalMap = new Map<string, { absence: MealAbsence; count: number }>();
  for (const meal of completedMeals) {
    for (const a of meal.absences) {
      if (a.reason === "refused") {
        const prev = refusalMap.get(a.residentId);
        refusalMap.set(a.residentId, { absence: a, count: (prev?.count ?? 0) + 1 });
      }
    }
  }
  const multipleRefusals = [...refusalMap.values()].filter((v) => v.count >= 2);

  return (
    <>
      {/* Consecutive miss alert */}
      {multipleRefusals.length > 0 && (
        <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5">
          <AlertTriangle size={13} className="text-destructive shrink-0 mt-0.5" />
          <div className="text-sm flex flex-col gap-0.5">
            {multipleRefusals.map(({ absence, count }) => (
              <div key={absence.residentId}>
                <span className="text-destructive font-medium">
                  {absence.residentName} ({absence.room})
                </span>
                <span className="text-muted-foreground">
                  {" "}— refused {count} meals today · Charge nurse notified · Weight monitoring active
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate("weights")}
            className="ml-auto text-xs text-destructive hover:text-destructive/80 font-medium shrink-0"
          >
            View Weights →
          </button>
        </div>
      )}

      {/* Export row */}
      <div className="flex justify-end">
        <button
          onClick={() => downloadAttendanceCSV(meals)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          <Download size={12} />
          Export Attendance CSV
        </button>
      </div>

      {/* 3-column meal layout */}
      <div className="grid grid-cols-3 gap-4">
        {meals.map((meal) => (
          <MealColumn
            key={meal.period}
            meal={meal}
            onTakeAttendance={() => setAttendanceFor(meal)}
          />
        ))}
      </div>

      {/* Attendance sheet for dinner */}
      <Sheet open={attendanceFor !== null} onOpenChange={(o) => !o && setAttendanceFor(null)}>
        <SheetContent className="w-[460px] sm:max-w-lg bg-card border-l border-border overflow-y-auto">
          {attendanceFor && (
            <AttendanceSheet
              meal={attendanceFor}
              onSave={(count) => {
                onSubmitDinnerAttendance(count);
                setAttendanceFor(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function MealColumn({ meal, onTakeAttendance }: { meal: MealService; onTakeAttendance: () => void }) {
  const isCompleted = meal.status === "completed";
  const isUpcoming = meal.status === "upcoming";
  const attendancePct = meal.totalCensus > 0
    ? Math.round((meal.attended / meal.totalCensus) * 100) : 0;

  const refusedCount = meal.absences.filter((a) => a.reason === "refused").length;
  const hospitalCount = meal.absences.filter((a) => a.reason === "hospital").length;
  const inRoomCount = meal.absences.filter((a) => a.reason === "in_room").length;
  const otherCount = meal.absences.filter(
    (a) => !["refused", "hospital", "in_room"].includes(a.reason),
  ).length;

  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      isCompleted ? "border-border" : isUpcoming ? "border-border opacity-60" : "border-primary/40",
    )}>
      {/* Header */}
      <div className={cn(
        "px-4 py-3 border-b border-border",
        isCompleted ? "bg-secondary/30" : isUpcoming ? "bg-secondary/10" : "bg-primary/5",
      )}>
        <div className="flex items-center justify-between mb-0.5">
          <div className="text-sm font-medium">{PERIOD_LABELS[meal.period]}</div>
          {isCompleted && <CheckCircle size={13} className="text-success" />}
          {isUpcoming && <Clock size={13} className="text-muted-foreground" />}
        </div>
        <div className="text-[11px] text-muted-foreground">{meal.time}</div>
      </div>

      <div className="p-3.5 flex flex-col gap-3">
        {/* Attendance */}
        {isCompleted ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground">Attendance</span>
              <span className={cn(
                "font-mono text-sm font-semibold",
                attendancePct >= 90 ? "text-success" : attendancePct >= 80 ? "text-accent" : "text-destructive",
              )}>
                {meal.attended}/{meal.totalCensus}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  attendancePct >= 90 ? "bg-success" : attendancePct >= 80 ? "bg-accent" : "bg-destructive",
                )}
                style={{ width: `${attendancePct}%` }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">{attendancePct}% participation</div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="text-[10px] text-muted-foreground mb-1">Expected attendance</div>
            <div className="font-mono text-lg font-semibold text-muted-foreground">
              ~{meal.totalCensus} residents
            </div>
          </div>
        )}

        {/* Diet breakdown */}
        {isCompleted && Object.keys(meal.dietBreakdown).length > 0 && (
          <div>
            <div className="text-[10px] text-muted-foreground mb-1.5">Diets Served</div>
            <div className="flex flex-col gap-1">
              {(Object.entries(meal.dietBreakdown) as [keyof typeof DIET_CONFIG, number][])
                .sort((a, b) => b[1] - a[1])
                .map(([diet, count]) => {
                  const cfg = DIET_CONFIG[diet];
                  return (
                    <div key={diet} className="flex items-center gap-1.5">
                      <div className={cn("size-1.5 rounded-full shrink-0", cfg.dot)} />
                      <span className="text-[10px] text-muted-foreground flex-1">{cfg.label}</span>
                      <span className="text-[10px] font-mono text-foreground">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Absences */}
        {isCompleted && meal.absences.length > 0 && (
          <div>
            <div className="text-[10px] text-muted-foreground mb-1.5">
              Absent ({meal.absences.length})
            </div>
            <div className="flex flex-col gap-1">
              {meal.absences.map((a) => (
                <div key={a.residentId} className="flex items-start gap-1.5 text-[10px]">
                  <span className={cn(
                    "px-1 py-0.5 rounded text-[9px] font-medium shrink-0",
                    a.reason === "refused" ? "bg-destructive/10 text-destructive"
                    : a.reason === "hospital" ? "bg-accent/10 text-accent"
                    : a.reason === "npo" ? "bg-purple-400/15 text-purple-300"
                    : "bg-secondary text-muted-foreground",
                  )}>
                    {ABSENCE_LABELS[a.reason]}
                  </span>
                  <span className="text-muted-foreground truncate">{a.residentName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary chips for completed */}
        {isCompleted && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-border/50">
            {refusedCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                {refusedCount} refused
              </span>
            )}
            {hospitalCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                {hospitalCount} hospital
              </span>
            )}
            {inRoomCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-medium">
                {inRoomCount} in-room
              </span>
            )}
            {otherCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-medium">
                {otherCount} other
              </span>
            )}
          </div>
        )}

        {/* Dinner — no absences shown for submitted attendance (just counts) */}
        {isCompleted && meal.absences.length === 0 && meal.period === "dinner" && (
          <div className="text-[10px] text-muted-foreground text-center pt-1 border-t border-border/50">
            <Utensils size={9} className="inline mr-1" />
            Attendance submitted
          </div>
        )}

        {/* Upcoming action */}
        {isUpcoming && (
          <button
            onClick={onTakeAttendance}
            className="flex items-center justify-center gap-1.5 w-full text-xs px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <ClipboardList size={12} />
            Take Attendance
          </button>
        )}
      </div>
    </div>
  );
}

function AttendanceSheet({ meal, onSave }: { meal: MealService; onSave: (count: number) => void }) {
  const [attended, setAttended] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setAttended((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  return (
    <>
      <SheetHeader className="mb-5">
        <SheetTitle>Dinner — Take Attendance</SheetTitle>
        <SheetDescription>
          {meal.time} · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} · {MOCK_DINNER_RESIDENTS.length} residents (sample)
        </SheetDescription>
      </SheetHeader>

      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
        Mark attended residents
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        {MOCK_DINNER_RESIDENTS.map((name) => {
          const isAttended = attended.has(name);
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-md border transition-colors text-left",
                isAttended ? "border-success/40 bg-success/5" : "border-border hover:bg-secondary/30",
              )}
            >
              <div className={cn(
                "size-5 rounded-full border-2 flex items-center justify-center shrink-0",
                isAttended ? "border-success bg-success text-primary-foreground" : "border-muted-foreground",
              )}>
                {isAttended && <CheckCircle size={10} className="text-card" />}
              </div>
              <span className="text-sm flex-1">{name}</span>
              {isAttended && <span className="text-[10px] text-success">Attended</span>}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{attended.size} of {MOCK_DINNER_RESIDENTS.length} marked</span>
        <span>{MOCK_DINNER_RESIDENTS.length - attended.size} remaining</span>
      </div>

      <button
        onClick={() => onSave(attended.size)}
        className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Bell size={13} />
        Save & Notify Families
      </button>
      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        Families of attended residents will receive an automated notification.
      </p>
    </>
  );
}
