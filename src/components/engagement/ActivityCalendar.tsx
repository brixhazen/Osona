import { useState } from "react";
import { CALENDAR_EVENTS, DOMAIN_CONFIG, type ActivityDomain } from "@/lib/mock/engagement";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Share2, Printer, Tv, Smartphone } from "lucide-react";

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Events are keyed by day-of-month; only May 2026 (month index 4) has mock data
const EVENTS_MONTH = 4;
const EVENTS_YEAR  = 2026;
const eventsByDay = new Map<number, typeof CALENDAR_EVENTS>();
for (const ev of CALENDAR_EVENTS) {
  if (!eventsByDay.has(ev.day)) eventsByDay.set(ev.day, []);
  eventsByDay.get(ev.day)!.push(ev);
}

function buildGrid(year: number, month: number): (number | null)[] {
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const DOMAIN_FILTER_OPTIONS: (ActivityDomain | "all")[] = [
  "all", "physical", "cognitive", "social", "creative", "spiritual", "volunteer", "one_to_one",
];

export function ActivityCalendar() {
  const _today = new Date();
  const [viewYear, setViewYear] = useState(EVENTS_YEAR);
  const [viewMonth, setViewMonth] = useState(EVENTS_MONTH); // default to data month (May 2026)
  const [selectedDay, setSelectedDay] = useState<number | null>(16);
  const [domainFilter, setDomainFilter] = useState<ActivityDomain | "all">("all");
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "published">("idle");

  const grid = buildGrid(viewYear, viewMonth);
  const monthLabel = `${MONTH_NAMES_LONG[viewMonth]} ${viewYear}`;
  const hasEventsThisMonth = viewYear === EVENTS_YEAR && viewMonth === EVENTS_MONTH;

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
    setSelectedDay(null);
  }

  function isTodayDay(day: number) {
    return viewYear === _today.getFullYear() && viewMonth === _today.getMonth() && day === _today.getDate();
  }
  function isPastDay(day: number) {
    if (viewYear < _today.getFullYear()) return true;
    if (viewYear === _today.getFullYear() && viewMonth < _today.getMonth()) return true;
    if (viewYear === _today.getFullYear() && viewMonth === _today.getMonth() && day < _today.getDate()) return true;
    return false;
  }

  const selectedEvents = selectedDay && hasEventsThisMonth
    ? (eventsByDay.get(selectedDay) ?? []).filter(
        (e) => domainFilter === "all" || e.domain === domainFilter,
      )
    : [];

  function handlePublish() {
    setPublishState("publishing");
    setTimeout(() => setPublishState("published"), 1200);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <button
          onClick={prevMonth}
          className="size-8 rounded-md border border-border hover:bg-secondary grid place-items-center transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="font-display font-semibold text-base">{monthLabel}</div>
        <button
          onClick={nextMonth}
          className="size-8 rounded-md border border-border hover:bg-secondary grid place-items-center transition-colors"
        >
          <ChevronRight size={14} />
        </button>

        {/* Domain filter chips */}
        <div className="flex items-center gap-1.5 ml-4 flex-wrap">
          {DOMAIN_FILTER_OPTIONS.map((d) => {
            const cfg = d !== "all" ? DOMAIN_CONFIG[d] : null;
            return (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className={cn(
                  "h-6 px-2.5 rounded-full text-[10px] font-medium border transition-colors",
                  domainFilter === d
                    ? "border-transparent text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
                style={domainFilter === d && cfg ? { backgroundColor: cfg.hex + "33", borderColor: cfg.hex + "66", color: cfg.hex } : {}}
              >
                {d === "all" ? "All" : cfg!.label}
              </button>
            );
          })}
        </div>

        {/* Publish button */}
        <button
          onClick={handlePublish}
          className={cn(
            "ml-auto flex items-center gap-2 text-xs px-3 py-1.5 rounded border font-medium transition-colors",
            publishState === "published"
              ? "border-success/40 bg-success/10 text-success"
              : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15",
          )}
        >
          <Share2 size={12} />
          {publishState === "publishing" ? "Publishing…" : publishState === "published" ? "Published ✓" : "Publish Calendar"}
        </button>
      </div>

      {/* Publish channels (when published) */}
      {publishState === "published" && (
        <div className="flex items-center gap-4 px-3 py-2 rounded-md bg-success/5 border border-success/20 text-[11px] text-success">
          <span className="font-medium">Calendar published to:</span>
          <span className="flex items-center gap-1"><Printer size={11} /> Print PDF</span>
          <span className="flex items-center gap-1"><Smartphone size={11} /> Family Portal</span>
          <span className="flex items-center gap-1"><Tv size={11} /> Digital Signage</span>
          <span className="flex items-center gap-1"><Tv size={11} /> Community TV</span>
        </div>
      )}

      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Calendar grid */}
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border bg-secondary/40">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="py-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {grid.map((day, i) => {
              const todayFlag = day !== null && isTodayDay(day);
              const isSelected = day === selectedDay;
              const events = day && hasEventsThisMonth ? (eventsByDay.get(day) ?? []) : [];
              const filteredEvents = events.filter((e) => domainFilter === "all" || e.domain === domainFilter);
              const isPast = day !== null && isPastDay(day);

              return (
                <div
                  key={i}
                  onClick={() => day && setSelectedDay(day)}
                  className={cn(
                    "min-h-[80px] p-1.5 border-b border-r border-border/50 last:border-r-0 transition-colors",
                    day ? "cursor-pointer hover:bg-secondary/30" : "bg-secondary/10",
                    isSelected && "bg-primary/5 border-primary/20",
                    isPast && "opacity-60",
                  )}
                >
                  {day && (
                    <>
                      <div className={cn(
                        "size-6 rounded-full grid place-items-center text-xs font-medium mb-1 mx-auto",
                        todayFlag ? "bg-primary text-primary-foreground" : "text-foreground",
                      )}>
                        {day}
                      </div>

                      {/* Domain dots */}
                      <div className="flex flex-wrap gap-0.5 justify-center">
                        {filteredEvents.slice(0, 4).map((ev, ei) => (
                          <div
                            key={ei}
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: DOMAIN_CONFIG[ev.domain].hex }}
                            title={ev.title}
                          />
                        ))}
                        {filteredEvents.length > 4 && (
                          <div className="text-[8px] text-muted-foreground">+{filteredEvents.length - 4}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {selectedDay ? (
            <>
              <div className="px-4 py-3 border-b border-border bg-secondary/30">
                <div className="font-medium text-sm">{MONTH_NAMES_LONG[viewMonth]} {selectedDay}, {viewYear}</div>
                <div className="text-[11px] text-muted-foreground">
                  {selectedEvents.length} program{selectedEvents.length !== 1 ? "s" : ""}
                  {isTodayDay(selectedDay) && " · Today"}
                  {!hasEventsThisMonth && " — no data for this month"}
                </div>
              </div>
              <div className="divide-y divide-border/50 max-h-[380px] overflow-y-auto">
                {selectedEvents.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground text-center">No programs scheduled</div>
                ) : (
                  selectedEvents.map((ev) => {
                    const cfg = DOMAIN_CONFIG[ev.domain];
                    return (
                      <div key={ev.id} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-secondary/20 transition-colors">
                        <div className="size-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: cfg.hex }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{ev.title}</div>
                          <div className="text-[11px] text-muted-foreground">{ev.time}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{cfg.label}</div>
                        </div>
                        {ev.recurring && (
                          <span className="text-[9px] text-muted-foreground border border-border/60 px-1 py-0.5 rounded shrink-0">
                            Recurring
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full p-8 text-sm text-muted-foreground">
              Select a day to view activities
            </div>
          )}
        </div>
      </div>

      {/* Domain legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {(Object.keys(DOMAIN_CONFIG) as ActivityDomain[]).map((d) => (
          <div key={d} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <div className="size-2 rounded-full" style={{ backgroundColor: DOMAIN_CONFIG[d].hex }} />
            {DOMAIN_CONFIG[d].label}
          </div>
        ))}
      </div>
    </div>
  );
}
