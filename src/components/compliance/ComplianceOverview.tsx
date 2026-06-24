import {
  INCIDENT_TYPE_CONFIG, SEVERITY_CONFIG, WORKFLOW_ORDER, CATEGORY_CONFIG, STATUS_URGENCY,
  LAST_SURVEY_DATE, NEXT_SURVEY_ESTIMATE, daysSince,
  type Incident, type ReadinessDomainGroup, type RegulatoryEvent,
} from "@/lib/mock/compliance";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, ShieldCheck, CalendarClock } from "lucide-react";

const SURVEY_WINDOW_START = "2026-09-01";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

type Tab = "overview" | "incidents" | "survey" | "qapi" | "calendar";

interface Props {
  liveScore: number;
  domains: ReadinessDomainGroup[];
  openIncidents: Incident[];
  events: RegulatoryEvent[];
  completedEvents: Set<string>;
  onNavigate: (tab: Tab) => void;
}

export function ComplianceOverview({ liveScore, domains, openIncidents, events, completedEvents, onNavigate }: Props) {
  const scoreColor =
    liveScore >= 90 ? "var(--color-success)"
    : liveScore >= 80 ? "var(--color-accent)"
    : "var(--color-destructive)";

  const upcomingEvents = events
    .filter((e) => !completedEvents.has(e.id) && e.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  const actionIncidents = [...openIncidents].sort((a, b) => {
    if (a.stateReportable && !a.stateReportedDate) return -1;
    if (b.stateReportable && !b.stateReportedDate) return 1;
    return b.severity - a.severity;
  });

  const allItems = domains.flatMap((d) => d.items);
  const completeItems = allItems.filter((i) => i.status === "complete").length;
  const missingItems = allItems.filter((i) => i.status === "missing").length;
  const attentionItems = allItems.filter((i) => i.status === "needs_attention").length;

  const radialData = [{ value: liveScore, fill: scoreColor }];
  const daysToSurveyWindow = Math.max(0, Math.ceil((new Date(SURVEY_WINDOW_START).getTime() - Date.now()) / 86_400_000));

  return (
    <div className="grid grid-cols-[1fr_320px] gap-5 items-start">
      {/* Left: readiness score + domain breakdown */}
      <div className="flex flex-col gap-4">
        {/* Score card */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-6">
            {/* Radial chart */}
            <div className="relative shrink-0">
              <ResponsiveContainer width={140} height={140}>
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius={48} outerRadius={68}
                  startAngle={210} endAngle={-30}
                  data={radialData}
                  barSize={14}
                >
                  <RadialBar dataKey="value" cornerRadius={7} background={{ fill: "var(--color-muted)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-mono text-3xl font-bold" style={{ color: scoreColor }}>
                  {liveScore}
                </div>
                <div className="text-[10px] text-muted-foreground">/100</div>
              </div>
            </div>

            <div className="flex-1">
              <div className="text-base font-semibold mb-0.5">Survey Readiness Score</div>
              <div className="text-[11px] text-muted-foreground mb-3">
                Last survey: {LAST_SURVEY_DATE} · {daysSince(LAST_SURVEY_DATE)} days ago · Next est. {NEXT_SURVEY_ESTIMATE}
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={11} className="text-success" />
                  <span className="text-foreground font-medium">{completeItems}</span>
                  <span className="text-muted-foreground">complete</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-accent" />
                  <span className="text-accent font-medium">{attentionItems}</span>
                  <span className="text-muted-foreground">needs attention</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={11} className="text-destructive" />
                  <span className="text-destructive font-medium">{missingItems}</span>
                  <span className="text-muted-foreground">missing</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-primary/80">
                <CalendarClock size={10} />
                <span>~{daysToSurveyWindow} days to survey window ({NEXT_SURVEY_ESTIMATE})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Domain breakdown */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Readiness by Domain</div>
          <div className="flex flex-col gap-2.5">
            {[...domains].sort((a, b) => a.score - b.score).map((d) => {
              const missingCount = d.items.filter((i) => i.status === "missing").length;
              const attentionCount = d.items.filter((i) => i.status === "needs_attention").length;

              return (
                <div key={d.domain}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground">{d.label}</span>
                      {missingCount > 0 && (
                        <span className="text-[9px] bg-destructive/10 text-destructive px-1 py-0.5 rounded font-medium">
                          {missingCount} missing
                        </span>
                      )}
                      {missingCount === 0 && attentionCount > 0 && (
                        <span className="text-[9px] bg-accent/10 text-accent px-1 py-0.5 rounded font-medium">
                          {attentionCount} to review
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "font-mono text-xs font-semibold",
                      d.score >= 90 ? "text-success" : d.score >= 80 ? "text-accent" : "text-destructive",
                    )}>
                      {d.score}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${d.score}%`,
                        backgroundColor: d.score >= 90 ? "var(--color-success)" : d.score >= 80 ? "var(--color-accent)" : "var(--color-destructive)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => onNavigate("survey")}
            className="mt-3 w-full text-[11px] text-primary hover:text-primary/80 transition-colors text-center"
          >
            View full survey prep checklist →
          </button>
        </div>
      </div>

      {/* Right: action needed + upcoming deadlines */}
      <div className="flex flex-col gap-4">
        {/* Incidents requiring action */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Requires Action ({actionIncidents.length})
            </div>
            <button onClick={() => onNavigate("incidents")} className="text-[10px] text-primary hover:text-primary/80">
              View all →
            </button>
          </div>
          <div className="divide-y divide-border/50">
            {actionIncidents.length === 0 ? (
              <div className="px-4 py-5 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <ShieldCheck size={20} className="text-success" />
                No open incidents
              </div>
            ) : (
              actionIncidents.map((inc) => {
                const isUrgent = inc.stateReportable && !inc.stateReportedDate;
                const typeCfg = INCIDENT_TYPE_CONFIG[inc.type];
                const sevCfg = SEVERITY_CONFIG[inc.severity];
                const step = WORKFLOW_ORDER[inc.status];

                return (
                  <div key={inc.id} className={cn("px-4 py-3", isUrgent && "bg-destructive/3")}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="text-xs font-medium">{inc.residentName}</div>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium", typeCfg.color)}>
                          {typeCfg.label}
                        </span>
                      </div>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium", sevCfg.cls)}>
                        {sevCfg.label}
                      </span>
                    </div>
                    {isUrgent && (
                      <div className="flex items-center gap-1 text-[10px] text-destructive font-medium">
                        <AlertTriangle size={9} />
                        State report due {inc.stateReportDeadline}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 h-1 rounded-full",
                            i < step ? "bg-primary" : i === step ? "bg-accent" : "bg-muted",
                          )}
                        />
                      ))}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      {inc.date} · {inc.reportedBy.split(",")[0]}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming deadlines */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Next Deadlines
            </div>
            <button onClick={() => onNavigate("calendar")} className="text-[10px] text-primary hover:text-primary/80">
              Full calendar →
            </button>
          </div>
          <div className="divide-y divide-border/50">
            {upcomingEvents.map((ev) => {
              const catCfg = CATEGORY_CONFIG[ev.category];
              const statusCfg = STATUS_URGENCY[ev.status];

              return (
                <div key={ev.id} className="px-4 py-2.5 flex items-start gap-2.5">
                  <div className={cn("size-1.5 rounded-full shrink-0 mt-1.5", catCfg.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium leading-tight truncate">{ev.title}</div>
                    <div className="text-[10px] text-muted-foreground">{ev.responsible.split(",")[0]}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono text-muted-foreground">{ev.dueDate.slice(5)}</div>
                    <span className={cn("text-[9px] px-1 py-0.5 rounded border font-medium", statusCfg.cls)}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
