import { useState } from "react";
import { WEEKLY_MENU, DIET_CONFIG, type MenuDay, type MealPeriod, type DietType } from "@/lib/mock/dining";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Printer, Share2, Smartphone, Tv } from "lucide-react";

const PERIOD_LABELS: Record<MealPeriod, string> = {
  breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner",
};

function makeWeekLabel(mon: Date): string {
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return `${mon.toLocaleString("default", { month: "short" })} ${mon.getDate()}–${sun.getDate()}`;
}

const TODAY_DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

export function MenuPlanner() {
  const [selectedDay, setSelectedDay] = useState<MenuDay>(
    WEEKLY_MENU.find((d) => d.dayOfWeek === TODAY_DOW) ?? WEEKLY_MENU[5],
  );
  const [selectedPeriod, setSelectedPeriod] = useState<MealPeriod>("lunch");
  const [publishState, setPublishState] = useState<"idle" | "publishing" | "published">("idle");

  const _today = new Date();
  const _mondayOffset = _today.getDay() === 0 ? 6 : _today.getDay() - 1;
  const thisMon = new Date(_today); thisMon.setDate(_today.getDate() - _mondayOffset);
  const week2Mon = new Date(thisMon); week2Mon.setDate(thisMon.getDate() + 7);
  const week3Mon = new Date(thisMon); week3Mon.setDate(thisMon.getDate() + 14);
  const weekHeader = `Week of ${makeWeekLabel(thisMon)}, ${_today.getFullYear()}`;

  function handlePublish() {
    setPublishState("publishing");
    setTimeout(() => setPublishState("published"), 1200);
  }

  const currentMeal = selectedDay.meals.find((m) => m.period === selectedPeriod);

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <button className="size-8 rounded-md border border-border hover:bg-secondary grid place-items-center transition-colors">
          <ChevronLeft size={14} />
        </button>
        <div className="font-display font-semibold text-base">{weekHeader}</div>
        <button className="size-8 rounded-md border border-border hover:bg-secondary grid place-items-center transition-colors">
          <ChevronRight size={14} />
        </button>
        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-secondary border border-border">
          Cycle Week 1 of 3
        </span>

        {/* Publish */}
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
          {publishState === "publishing" ? "Publishing…" : publishState === "published" ? "Published ✓" : "Publish Menu"}
        </button>
      </div>

      {/* Publish confirmation strip */}
      {publishState === "published" && (
        <div className="flex items-center gap-4 px-3 py-2 rounded-md bg-success/5 border border-success/20 text-[11px] text-success">
          <span className="font-medium">Menu published to:</span>
          <span className="flex items-center gap-1"><Printer size={11} /> Print PDF</span>
          <span className="flex items-center gap-1"><Smartphone size={11} /> Family Portal</span>
          <span className="flex items-center gap-1"><Tv size={11} /> Digital Signage</span>
          <span className="flex items-center gap-1"><Tv size={11} /> Dining Room TV</span>
        </div>
      )}

      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Weekly grid */}
        <div className="flex flex-col gap-2">
          {/* Day selector */}
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKLY_MENU.map((day) => {
              const isToday = day.dayOfWeek === TODAY_DOW;
              const isSelected = day.dayNum === selectedDay.dayNum;
              return (
                <button
                  key={day.dayNum}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "rounded-lg border p-2 text-center transition-colors",
                    isSelected ? "border-primary/40 bg-primary/5"
                    : isToday ? "border-primary/20"
                    : "border-border hover:bg-secondary/30",
                  )}
                >
                  <div className={cn(
                    "text-[10px] font-medium mb-0.5",
                    isToday ? "text-primary" : "text-muted-foreground",
                  )}>
                    {day.dayOfWeek}
                  </div>
                  <div className={cn(
                    "size-6 rounded-full grid place-items-center text-xs font-medium mx-auto",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                  )}>
                    {day.dayNum}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{day.date.split(" ")[0]}</div>
                </button>
              );
            })}
          </div>

          {/* Meal period tabs */}
          <div className="flex border-b border-border">
            {(["breakfast", "lunch", "dinner"] as MealPeriod[]).map((period) => {
              const meal = selectedDay.meals.find((m) => m.period === period);
              return (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                    selectedPeriod === period
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {PERIOD_LABELS[period]}
                  {meal && (
                    <span className="ml-1.5 text-[10px] opacity-60">{meal.time}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Menu variants */}
          {currentMeal ? (
            <div className="flex flex-col gap-2">
              {currentMeal.variants.map((variant, i) => {
                const isDietSpecific = variant.dietType !== "all";
                const cfg = isDietSpecific && variant.dietType !== "all"
                  ? DIET_CONFIG[variant.dietType as DietType]
                  : null;

                return (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg border p-3.5",
                      isDietSpecific ? "border-border" : "border-primary/20 bg-primary/3",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {cfg ? (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", cfg.color)}>
                          {cfg.label}
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground font-medium">
                          {variant.label}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {variant.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-1.5 text-[11px] text-foreground/80">
                          <div className="size-1 rounded-full bg-muted-foreground/60 shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
              No menu data for this period.
            </div>
          )}
        </div>

        {/* Right panel: diet legend + cycle info */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Diet Legend</div>
            <div className="flex flex-col gap-1.5">
              {(Object.entries(DIET_CONFIG) as [DietType, typeof DIET_CONFIG[DietType]][]).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn("size-2 rounded-full shrink-0", cfg.dot)} />
                  <span className="text-[11px] text-muted-foreground flex-1">{cfg.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{cfg.abbr}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Cycle Menu</div>
            <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <span className="text-primary font-medium">Week 1 (current)</span>
                <span>{makeWeekLabel(thisMon)}</span>
              </div>
              <div className="flex justify-between">
                <span>Week 2</span>
                <span>{makeWeekLabel(week2Mon)}</span>
              </div>
              <div className="flex justify-between">
                <span>Week 3</span>
                <span>{makeWeekLabel(week3Mon)}</span>
              </div>
              <div className="border-t border-border/60 mt-1 pt-1 text-[10px]">
                3-week rotating cycle
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Important Notes</div>
            <div className="flex flex-col gap-1.5 text-[10px] text-muted-foreground">
              {[
                "Clam chowder (Thu lunch) — substitute for shellfish allergy residents",
                "Grapefruit (Wed breakfast) — check medication interactions",
                "All pureed items must be honey-thick for Vivian Marsh (MC-201)",
                "Peanut products NEVER served — Raymond Kowalski severe allergy",
                "Margaret Olson (E-114): track fluid at every meal — 1,200 mL/day max",
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-accent shrink-0 mt-0.5">!</span>
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
