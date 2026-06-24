import { useState } from "react";
import {
  REGULATORY_EVENTS, CATEGORY_CONFIG, STATUS_URGENCY,
  type RegulatoryEvent, type RegulatoryCategory, type RegulatoryStatus,
} from "@/lib/mock/compliance";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Pencil, Check, X } from "lucide-react";

interface Props {
  events: RegulatoryEvent[];
  completedEvents: Set<string>;
  onToggleComplete: (eventId: string) => void;
  onUpdateEventNote: (eventId: string, note: string) => void;
}

const CATEGORY_FILTERS: (RegulatoryCategory | "all")[] = [
  "all", "clinical", "staffing", "safety", "administrative", "training",
];

const MONTH_ORDER: Record<string, number> = {
  "2026-05": 0, "2026-06": 1, "2026-07": 2, "2026-08": 3, "2026-09": 4,
};

const MONTH_LABELS: Record<string, string> = {
  "2026-05": "May 2026",
  "2026-06": "June 2026",
  "2026-07": "July 2026",
  "2026-08": "August 2026",
  "2026-09": "September 2026",
};

export function RegulatoryCalendar({ events, completedEvents, onToggleComplete, onUpdateEventNote }: Props) {
  const [catFilter, setCatFilter] = useState<RegulatoryCategory | "all">("all");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteValue, setEditNoteValue] = useState("");

  function startEditNote(ev: RegulatoryEvent) {
    setEditingNoteId(ev.id);
    setEditNoteValue(ev.notes ?? "");
  }

  function saveNote(eventId: string) {
    onUpdateEventNote(eventId, editNoteValue);
    setEditingNoteId(null);
  }

  function cancelNote() {
    setEditingNoteId(null);
  }

  const filtered = events.filter(
    (e) => catFilter === "all" || e.category === catFilter,
  );

  const byMonth = new Map<string, typeof events>();
  for (const ev of filtered) {
    const month = ev.dueDate.slice(0, 7);
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(ev);
  }

  const sortedMonths = [...byMonth.keys()].sort(
    (a, b) => (MONTH_ORDER[a] ?? 99) - (MONTH_ORDER[b] ?? 99),
  );

  const dueSoonCount = filtered.filter((e) => e.status === "due_soon" && !completedEvents.has(e.id)).length;
  const overdueCount = filtered.filter((e) => e.status === "overdue" && !completedEvents.has(e.id)).length;
  const completedCount = completedEvents.size;

  return (
    <div className="flex gap-5 items-start">
      {/* Main calendar */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORY_FILTERS.map((cat) => {
            const cfg = cat !== "all" ? CATEGORY_CONFIG[cat] : null;
            const count = cat === "all"
              ? events.length
              : events.filter((e) => e.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                  catFilter === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {cat === "all" ? "All" : cfg!.label}
                <span className="ml-1.5 font-mono opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Month groups */}
        <div className="flex flex-col gap-5">
          {sortedMonths.map((month) => {
            const monthEvents = byMonth.get(month)!.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
            return (
              <div key={month}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                  <span>{MONTH_LABELS[month] ?? month}</span>
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="font-mono">{monthEvents.length} event{monthEvents.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {monthEvents.map((ev) => {
                    const catCfg = CATEGORY_CONFIG[ev.category];
                    const effectiveStatus: RegulatoryStatus = completedEvents.has(ev.id) ? "completed" : ev.status;
                    const statusCfg = STATUS_URGENCY[effectiveStatus];
                    const isCompleted = effectiveStatus === "completed";
                    const isEditingNote = editingNoteId === ev.id;

                    return (
                      <div
                        key={ev.id}
                        className={cn(
                          "rounded-lg border p-3.5 flex items-start gap-3 transition-colors",
                          effectiveStatus === "overdue" ? "border-destructive/40 bg-destructive/3"
                          : effectiveStatus === "due_soon" ? "border-accent/30 bg-accent/3"
                          : isCompleted ? "border-border opacity-60"
                          : "border-border bg-card",
                        )}
                      >
                        {/* Category dot */}
                        <div className={cn("size-2 rounded-full shrink-0 mt-1.5", catCfg.dot)} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-sm font-medium leading-snug">{ev.title}</div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", catCfg.color)}>
                                {catCfg.label}
                              </span>
                              <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", statusCfg.cls)}>
                                {statusCfg.label}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                            <span className="font-mono font-medium text-foreground/80">{ev.dueDate}</span>
                            <span>·</span>
                            <span>{ev.responsible}</span>
                            <span>·</span>
                            <span className="capitalize">{ev.recurring}</span>
                          </div>

                          {/* Notes — inline editable */}
                          {isEditingNote ? (
                            <div className="mt-1.5 flex flex-col gap-1.5">
                              <textarea
                                value={editNoteValue}
                                onChange={(e) => setEditNoteValue(e.target.value)}
                                autoFocus
                                rows={2}
                                className="w-full rounded border border-border bg-background px-2 py-1.5 text-[10px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => saveNote(ev.id)}
                                  className="flex items-center gap-1 h-6 px-2 rounded bg-success/15 text-success text-[10px] font-medium hover:bg-success/25 transition-colors"
                                >
                                  <Check size={9} /> Save
                                </button>
                                <button
                                  onClick={cancelNote}
                                  className="flex items-center gap-1 h-6 px-2 rounded border border-border text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <X size={9} /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-1 mt-1.5 group/note">
                              {ev.notes ? (
                                <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">{ev.notes}</p>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/50 italic flex-1">No notes</span>
                              )}
                              {!isCompleted && (
                                <button
                                  onClick={() => startEditNote(ev)}
                                  className="shrink-0 p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover/note:opacity-100 transition-all"
                                  title="Edit note"
                                >
                                  <Pencil size={9} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Complete toggle */}
                        <button
                          onClick={() => onToggleComplete(ev.id)}
                          className={cn(
                            "shrink-0 size-6 rounded-full border flex items-center justify-center transition-colors",
                            isCompleted
                              ? "border-success bg-success/15 text-success"
                              : "border-border hover:border-success/60 text-muted-foreground hover:text-success",
                          )}
                          title={isCompleted ? "Mark incomplete" : "Mark complete"}
                        >
                          {isCompleted
                            ? <CheckCircle size={12} />
                            : <Circle size={12} />
                          }
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-[240px] shrink-0 flex flex-col gap-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Calendar Summary</div>

        <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-2">
          <SideRow label="Total Events" value={String(events.length)} />
          <SideRow label="Due Soon (< 7 days)" value={String(dueSoonCount)} cls="text-accent" />
          <SideRow label="Overdue" value={String(overdueCount)} cls={overdueCount > 0 ? "text-destructive" : undefined} />
          <SideRow label="Completed" value={String(completedCount)} cls="text-success" />
        </div>

        {/* Category legend */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Categories</div>
          <div className="flex flex-col gap-1.5">
            {(Object.keys(CATEGORY_CONFIG) as RegulatoryCategory[]).map((cat) => (
              <div key={cat} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <div className={cn("size-2 rounded-full shrink-0", CATEGORY_CONFIG[cat].dot)} />
                {CATEGORY_CONFIG[cat].label}
                <span className="ml-auto font-mono text-[10px]">
                  {events.filter((e) => e.category === cat).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring info */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Recurring Schedule</div>
          <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
            <div className="flex justify-between"><span>Monthly</span><span className="font-mono">Fire drills</span></div>
            <div className="flex justify-between"><span>Quarterly</span><span className="font-mono">QAPI, care plans</span></div>
            <div className="flex justify-between"><span>Annual</span><span className="font-mono">TB, license, IPCP</span></div>
            <div className="flex justify-between"><span>Biennial</span><span className="font-mono">CNA renewals</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideRow({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono font-semibold", cls ?? "text-foreground")}>{value}</span>
    </div>
  );
}
