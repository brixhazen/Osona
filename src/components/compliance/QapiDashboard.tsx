import { useState } from "react";
import {
  QAPI_MEETINGS,
  type QapiIndicator, type QapiPip, type QapiPipIntervention,
} from "@/lib/mock/compliance";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Minus,
  Target, Calendar, Users, CheckSquare, Square,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine,
} from "recharts";

interface Props {
  indicators: QapiIndicator[];
  pips: QapiPip[];
  onUpdateIndicatorValue: (id: string, value: number) => void;
  onTogglePipIntervention: (pipId: string, index: number) => void;
}

export function QapiDashboard({ indicators, pips, onUpdateIndicatorValue, onTogglePipIntervention }: Props) {
  const [logValueId, setLogValueId] = useState<string | null>(null);
  const alertCount = indicators.filter((q) => q.inAlert).length;

  return (
    <div className="flex flex-col gap-5">
      {/* QAPI indicators grid */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
          Quality Indicators — {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {indicators.map((q) => (
            <IndicatorTile
              key={q.id}
              indicator={q}
              isLogging={logValueId === q.id}
              onToggleLog={() => setLogValueId(logValueId === q.id ? null : q.id)}
              onUpdateValue={(v) => {
                onUpdateIndicatorValue(q.id, v);
                setLogValueId(null);
              }}
            />
          ))}
        </div>
      </div>

      {/* PIPs + meeting log */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Active PIPs */}
        <div className="flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Performance Improvement Projects ({pips.length} active)
          </div>
          {pips.map((pip) => (
            <PipCard
              key={pip.id}
              pip={pip}
              onToggleIntervention={(index) => onTogglePipIntervention(pip.id, index)}
            />
          ))}
        </div>

        {/* Right: meeting log + alert summary */}
        <div className="flex flex-col gap-3">
          {/* QAPI meeting schedule */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              <Calendar size={11} />
              QAPI Meeting Schedule
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium">Last Meeting</div>
                  <div className="text-[10px] text-muted-foreground">March 31, 2026</div>
                </div>
                <CheckCircle size={12} className="text-success" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium">Next Meeting</div>
                  <div className="text-[10px] text-muted-foreground">August 31, 2026</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 font-medium">
                  Upcoming
                </span>
              </div>
            </div>

            {QAPI_MEETINGS[0] && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Last Meeting Notes</div>
                <div className="flex flex-col gap-1">
                  {QAPI_MEETINGS[0].highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                      <span className="shrink-0 mt-0.5">·</span>
                      {h}
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Users size={9} />
                  {QAPI_MEETINGS[0].attendees.length} attendees
                </div>
              </div>
            )}
          </div>

          {/* Alert summary */}
          {alertCount > 0 && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-destructive mb-2">
                <AlertTriangle size={11} />
                Indicators In Alert
              </div>
              {indicators.filter((q) => q.inAlert).map((q) => (
                <div key={q.id} className="text-[11px] text-destructive/90 mb-1">
                  <span className="font-medium">{q.name}:</span> {q.value} {q.unit} (benchmark {q.benchmark})
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                Fall Reduction PIP is active. Reassess at August 31 QAPI meeting.
              </p>
            </div>
          )}
          {alertCount === 0 && (
            <div className="rounded-lg border border-success/20 bg-success/5 p-3 flex items-center gap-2 text-[11px] text-success">
              <CheckCircle size={13} />
              All indicators within benchmark
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IndicatorTile({
  indicator: q,
  isLogging,
  onToggleLog,
  onUpdateValue,
}: {
  indicator: QapiIndicator;
  isLogging: boolean;
  onToggleLog: () => void;
  onUpdateValue: (v: number) => void;
}) {
  const [inputVal, setInputVal] = useState(String(q.value));
  const chartData = q.history.map((h) => ({ month: h.month, value: h.value }));

  const trendIcon = q.trend === "improving"
    ? <TrendingDown size={12} className="text-success" />
    : q.trend === "worsening"
    ? <TrendingUp size={12} className="text-destructive" />
    : <Minus size={12} className="text-muted-foreground" />;

  const trendCls = q.trend === "improving" ? "text-success" : q.trend === "worsening" ? "text-destructive" : "text-muted-foreground";
  const trendLabel = q.trend === "improving" ? "Improving" : q.trend === "worsening" ? "Worsening" : "Stable";

  const lineColor = q.inAlert
    ? "var(--color-destructive)"
    : q.trend === "improving"
    ? "var(--color-success)"
    : "var(--color-primary)";

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(inputVal);
    if (!isNaN(num) && num >= 0) onUpdateValue(num);
  }

  return (
    <div className={cn(
      "rounded-lg border bg-card p-4",
      q.inAlert ? "border-destructive/40" : "border-border",
    )}>
      <div className="flex items-start justify-between mb-1">
        <div className="text-xs font-medium leading-tight">{q.name}</div>
        {q.inAlert && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium shrink-0 ml-1">
            ALERT
          </span>
        )}
      </div>

      <div className={cn(
        "font-mono text-2xl font-bold mb-0.5",
        q.inAlert ? "text-destructive" : "text-foreground",
      )}>
        {q.value}
      </div>
      <div className="text-[10px] text-muted-foreground mb-2">{q.unit}</div>

      <div className="flex items-center gap-2 mb-3 text-[10px]">
        <div className={cn("flex items-center gap-0.5", trendCls)}>
          {trendIcon}
          <span>{trendLabel}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground ml-auto">
          <Target size={9} />
          <span>Target: {q.target}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={chartData}>
          <XAxis dataKey="month" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "6px", fontSize: "10px" }}
            formatter={(v: number) => [v, q.name]}
          />
          <ReferenceLine
            y={q.benchmark}
            stroke="var(--color-muted-foreground)"
            strokeDasharray="3 3"
            label={{ value: "Benchmark", fontSize: 7, fill: "var(--color-muted-foreground)", position: "insideTopLeft" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 2, fill: lineColor }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="text-[9px] text-muted-foreground mt-1 text-center">
        Benchmark: {q.benchmark} {q.unit}
      </div>

      {/* Log Value toggle */}
      {!isLogging ? (
        <button
          onClick={onToggleLog}
          className="mt-2 w-full text-[10px] py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        >
          Log Value
        </button>
      ) : (
        <form onSubmit={handleUpdate} className="mt-2 flex items-center gap-1.5">
          <input
            type="number"
            step="0.1"
            min="0"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            autoFocus
            className="flex-1 h-7 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            className="h-7 px-2.5 rounded bg-primary text-primary-foreground text-[10px] font-medium hover:bg-primary/90 transition-colors shrink-0"
          >
            Update
          </button>
          <button
            type="button"
            onClick={onToggleLog}
            className="h-7 px-2 rounded border border-border text-[10px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            ✕
          </button>
        </form>
      )}
    </div>
  );
}

function PipCard({
  pip,
  onToggleIntervention,
}: {
  pip: QapiPip;
  onToggleIntervention: (index: number) => void;
}) {
  const progress = Math.max(0, Math.min(100,
    ((pip.baselineValue - pip.currentValue) / (pip.baselineValue - pip.targetValue)) * 100,
  ));
  const isImproving = pip.currentValue < pip.baselineValue;
  const completedCount = pip.interventions.filter((iv) => iv.completed).length;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-sm font-medium">{pip.title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Lead: {pip.lead} · Target date: {pip.targetDate}
          </div>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium shrink-0">
          Active
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{pip.goal}</p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">Progress toward target</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              Baseline: <span className="font-mono font-medium text-foreground">{pip.baselineValue} {pip.unit}</span>
            </span>
            <span className="text-muted-foreground">
              Now: <span className={cn("font-mono font-medium", isImproving ? "text-success" : "text-destructive")}>{pip.currentValue} {pip.unit}</span>
            </span>
            <span className="text-muted-foreground">
              Target: <span className="font-mono font-medium text-primary">{pip.targetValue} {pip.unit}</span>
            </span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", isImproving ? "bg-success" : "bg-destructive")}
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
        <div className="text-[9px] text-muted-foreground mt-0.5">
          {isImproving
            ? `${Math.round(progress)}% toward target`
            : "Not yet showing improvement from baseline"}
        </div>
      </div>

      {/* Interventions — clickable checkboxes */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Interventions</div>
          <span className="text-[10px] text-muted-foreground font-mono">
            {completedCount}/{pip.interventions.length}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {pip.interventions.map((iv: QapiPipIntervention, i: number) => (
            <button
              key={i}
              onClick={() => onToggleIntervention(i)}
              className="flex items-start gap-2 text-left group w-full hover:bg-secondary/30 rounded px-1 py-0.5 transition-colors"
            >
              <div className="shrink-0 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
                {iv.completed
                  ? <CheckSquare size={12} className="text-success" />
                  : <Square size={12} className="text-muted-foreground" />
                }
              </div>
              <span className={cn(
                "text-[11px] leading-snug",
                iv.completed ? "line-through text-muted-foreground" : "text-foreground/80",
              )}>
                {iv.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
