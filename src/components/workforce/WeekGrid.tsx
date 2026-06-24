import { useState } from "react";
import { type DailyShift, type ShiftPeriod } from "@/lib/mock/workforce";
import { cn } from "@/lib/utils";

const MODULE_COLOR = "#818CF8";

const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

interface WeekDay {
  label: string;
  date: string;
  isToday: boolean;
  dayIndex: number; // 0 = Mon … 6 = Sun
}

// [filled, total] for non-today days, keyed by day-of-week index (0=Mon)
const STATIC_WEEK: Record<number, Record<ShiftPeriod, [number, number]>> = {
  0: { Day: [12, 12], Evening: [10, 10], Night: [4, 4] },
  1: { Day: [12, 12], Evening: [9,  10], Night: [4, 4] },
  2: { Day: [11, 12], Evening: [10, 10], Night: [4, 4] },
  3: { Day: [12, 12], Evening: [10, 10], Night: [4, 4] },
  4: { Day: [11, 12], Evening: [10, 10], Night: [3, 4] },
  5: { Day: [10, 12], Evening: [9,  10], Night: [4, 4] },
  6: { Day: [11, 12], Evening: [9,  10], Night: [3, 4] },
};

const PERIODS: ShiftPeriod[] = ["Day", "Evening", "Night"];

const PERIOD_META: Record<ShiftPeriod, { label: string; time: string; dot: string }> = {
  Day:     { label: "Day",     time: "7a – 3p",  dot: "bg-amber-400"  },
  Evening: { label: "Evening", time: "3p – 11p", dot: "bg-orange-400" },
  Night:   { label: "Night",   time: "11p – 7a", dot: "bg-indigo-400" },
};

function buildWeekDays(): WeekDay[] {
  const today = new Date();
  const diffToMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label,
      date: `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`,
      isToday: d.toDateString() === today.toDateString(),
      dayIndex: i,
    };
  });
}

function getISOWeekNumber(d: Date): number {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

const ROLE_OPTIONS = ["All", "RN", "LPN", "CNA", "Med Tech"] as const;
type RoleFilter = typeof ROLE_OPTIONS[number];

function getTodayCoverage(shifts: DailyShift[], period: ShiftPeriod, role: RoleFilter): [number, number] {
  const shift = shifts.find((s) => s.period === period);
  if (!shift) return [0, 0];
  const slots = role === "All" ? shift.slots : shift.slots.filter((s) => s.role === role);
  const filled = slots.filter((s) => s.status === "scheduled" || s.status === "agency_fill").length;
  return [filled, slots.length];
}

function tone(filled: number, total: number): "ok" | "warn" | "danger" {
  if (total === 0) return "ok";
  const pct = (filled / total) * 100;
  return pct === 100 ? "ok" : pct >= 75 ? "warn" : "danger";
}

interface Props {
  todayShifts: DailyShift[];
}

export function WeekGrid({ todayShifts }: Props) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const weekDays = buildWeekDays();
  const weekNum = getISOWeekNumber(new Date());
  const year = new Date().getFullYear();

  return (
    <div className="space-y-3">
      {/* Role filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {ROLE_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={cn(
              "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
              roleFilter === r
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {r}
          </button>
        ))}
        {roleFilter !== "All" && (
          <span className="text-[11px] text-muted-foreground ml-1">
            Filtering today's column — other days show total coverage
          </span>
        )}
      </div>

    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header row */}
      <div
        className="grid border-b border-border bg-muted/20"
        style={{ gridTemplateColumns: "96px repeat(7, 1fr)" }}
      >
        <div className="px-3 py-3" />
        {weekDays.map((day) => (
          <div
            key={day.date}
            className={cn(
              "px-2 py-3 text-center border-l border-border",
              day.isToday && "bg-[#818CF8]/8",
            )}
          >
            <div
              className="text-xs font-semibold"
              style={day.isToday ? { color: MODULE_COLOR } : undefined}
            >
              {day.label}
            </div>
            <div
              className={cn("text-[10px] mt-0.5", !day.isToday && "text-muted-foreground")}
              style={day.isToday ? { color: `${MODULE_COLOR}B3` } : undefined}
            >
              {day.date}
            </div>
            {day.isToday && (
              <div
                className="mt-1.5 text-[9px] px-1.5 py-0.5 rounded font-semibold inline-block uppercase tracking-wide"
                style={{ backgroundColor: `${MODULE_COLOR}25`, color: MODULE_COLOR }}
              >
                Today
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Period rows */}
      {PERIODS.map((period, periodIdx) => (
        <div
          key={period}
          className={cn("grid", periodIdx < PERIODS.length - 1 && "border-b border-border")}
          style={{ gridTemplateColumns: "96px repeat(7, 1fr)" }}
        >
          {/* Period label */}
          <div className="px-3 py-4 flex flex-col justify-center gap-1 bg-muted/10 border-r border-border">
            <div className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full shrink-0", PERIOD_META[period].dot)} />
              <span className="text-xs font-semibold">{PERIOD_META[period].label}</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{PERIOD_META[period].time}</span>
          </div>

          {/* Day cells */}
          {weekDays.map((day) => {
            const [filled, total] = day.isToday
              ? getTodayCoverage(todayShifts, period, roleFilter)
              : (STATIC_WEEK[day.dayIndex]?.[period] ?? [0, 0]);
            const pct = total > 0 ? (filled / total) * 100 : 100;
            const t = tone(filled, total);
            const open = total - filled;

            return (
              <div
                key={day.date}
                className={cn(
                  "px-3 py-4 border-l border-border flex flex-col gap-2.5 transition-opacity",
                  day.isToday && "bg-[#818CF8]/5",
                  !day.isToday && roleFilter !== "All" && "opacity-40",
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={cn(
                    "font-mono text-sm font-semibold tabular-nums leading-none",
                    t === "danger" ? "text-destructive" : t === "warn" ? "text-accent" : "text-foreground",
                  )}>
                    {filled}/{total}
                  </span>
                  {open > 0 && (
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-medium leading-none",
                      t === "danger"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-accent/10 text-accent",
                    )}>
                      {open}
                    </span>
                  )}
                </div>

                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      t === "danger" ? "bg-destructive" : t === "warn" ? "bg-accent" : "bg-success",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-5 px-4 py-2.5 border-t border-border bg-muted/20">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Coverage
        </span>
        {[
          { dot: "bg-success",     label: "Full" },
          { dot: "bg-accent",      label: "1–2 gaps" },
          { dot: "bg-destructive", label: "Critical" },
        ].map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-1.5 rounded-full", dot)} />
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {weekDays[0].date} – {weekDays[6].date}, {year} · Week {weekNum}
        </span>
      </div>
    </div>
    </div>
  );
}
