import { useState } from "react";
import {
  PAST_DEFICIENCIES, LAST_SURVEY_DATE, daysSince,
  type ReadinessDomainGroup, type ReadinessDomain,
} from "@/lib/mock/compliance";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, ChevronDown, ChevronRight,
  Clock, ShieldCheck,
} from "lucide-react";

interface Props {
  domains: ReadinessDomainGroup[];
  liveScore: number;
  onCycleItemStatus: (domain: ReadinessDomain, itemId: string) => void;
}

export function SurveyPrep({ domains, liveScore, onCycleItemStatus }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["staffing", "staff_training"]),
  );

  function toggleDomain(domain: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(domain) ? next.delete(domain) : next.add(domain);
      return next;
    });
  }

  const allItems = domains.flatMap((d) => d.items);
  const completeItems = allItems.filter((i) => i.status === "complete").length;
  const missingItems = allItems.filter((i) => i.status === "missing").length;
  const attentionItems = allItems.filter((i) => i.status === "needs_attention").length;

  return (
    <div className="flex gap-5 items-start">
      {/* Main: checklist */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Summary strip */}
        <div className="grid grid-cols-4 gap-3">
          <SummaryCard
            label="Readiness Score"
            value={`${liveScore}/100`}
            cls={liveScore >= 90 ? "text-success" : liveScore >= 80 ? "text-accent" : "text-destructive"}
          />
          <SummaryCard label="Complete" value={String(completeItems)} cls="text-success" />
          <SummaryCard label="Needs Attention" value={String(attentionItems)} cls="text-accent" />
          <SummaryCard label="Missing / Critical" value={String(missingItems)} cls="text-destructive" />
        </div>

        {/* Checklist domains */}
        <div className="flex flex-col gap-2">
          {[...domains].sort((a, b) => a.score - b.score).map((d) => (
            <DomainSection
              key={d.domain}
              domain={d}
              isExpanded={expanded.has(d.domain)}
              onToggle={() => toggleDomain(d.domain)}
              onCycleItem={(itemId) => onCycleItemStatus(d.domain, itemId)}
            />
          ))}
        </div>
      </div>

      {/* Right: survey history */}
      <div className="w-[280px] shrink-0 flex flex-col gap-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Survey History</div>

        {/* Last survey card */}
        <div className="rounded-lg border border-success/20 bg-success/5 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={14} className="text-success" />
            <div className="text-sm font-medium text-success">Last Survey Passed</div>
          </div>
          <div className="text-[11px] text-muted-foreground mb-1">March 12, 2026 · {daysSince(LAST_SURVEY_DATE)} days ago</div>
          <div className="text-[11px] text-muted-foreground">
            State annual inspection — unannounced. 2 deficiencies issued, both corrected and accepted.
          </div>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-success">
            <CheckCircle size={10} />
            0 active deficiencies
          </div>
        </div>

        {/* Deficiency cards */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            March 2026 Deficiencies ({PAST_DEFICIENCIES.length})
          </div>
          {PAST_DEFICIENCIES.map((def) => (
            <div key={def.id} className="rounded-lg border border-success/20 bg-card p-3">
              <div className="flex items-start justify-between mb-1.5">
                <div>
                  <div className="text-xs font-medium">{def.tag}</div>
                  <div className="text-[10px] text-muted-foreground">{def.category} · Severity {def.severity}</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20 font-medium">
                  POC Accepted ✓
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{def.description}</p>
              <div className="border-t border-border/60 pt-2">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Corrective Action</div>
                <p className="text-[10px] text-foreground/70 leading-relaxed">{def.pocSummary}</p>
                <div className="flex gap-2 mt-1.5 text-[10px] text-muted-foreground">
                  <span>Submitted: {def.pocSubmittedDate}</span>
                  <span>·</span>
                  <span>Accepted: {def.pocAcceptedDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Survey Readiness Tips</div>
          <div className="flex flex-col gap-1.5 text-[10px] text-muted-foreground">
            {[
              "Resolve Carol Nguyen's expired CNA license immediately",
              "Complete overdue quarterly reviews for Lambert & Ingram",
              "Update IPCP policy — last review was 14 months ago",
              "Close out 4 staff missing annual in-service hours",
              "File Margaret Olson state report",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <ChevronRight size={9} className="shrink-0 mt-0.5 text-accent" />
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DomainSection({
  domain: d, isExpanded, onToggle, onCycleItem,
}: {
  domain: ReadinessDomainGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onCycleItem: (itemId: string) => void;
}) {
  const missingCount = d.items.filter((i) => i.status === "missing").length;
  const attentionCount = d.items.filter((i) => i.status === "needs_attention").length;
  const completeCount = d.items.filter((i) => i.status === "complete").length;

  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      missingCount > 0 ? "border-destructive/30" : attentionCount > 0 ? "border-accent/20" : "border-border",
    )}>
      {/* Domain header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-card hover:bg-secondary/30 transition-colors text-left"
      >
        <div className={cn(
          "size-6 rounded-full flex items-center justify-center shrink-0",
          missingCount > 0 ? "bg-destructive/15 text-destructive"
          : attentionCount > 0 ? "bg-accent/15 text-accent"
          : "bg-success/15 text-success",
        )}>
          {missingCount > 0
            ? <AlertTriangle size={11} />
            : attentionCount > 0
            ? <Clock size={11} />
            : <CheckCircle size={11} />
          }
        </div>

        <div className="flex-1">
          <div className="text-sm font-medium">{d.label}</div>
          <div className="text-[10px] text-muted-foreground">
            {completeCount}/{d.items.length} complete
            {missingCount > 0 && ` · ${missingCount} missing`}
            {attentionCount > 0 && ` · ${attentionCount} need attention`}
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${d.score}%`,
                backgroundColor: d.score >= 90 ? "var(--color-success)" : d.score >= 80 ? "var(--color-accent)" : "var(--color-destructive)",
              }}
            />
          </div>
          <span className={cn(
            "font-mono text-xs font-semibold w-8 text-right",
            d.score >= 90 ? "text-success" : d.score >= 80 ? "text-accent" : "text-destructive",
          )}>
            {d.score}%
          </span>
          {isExpanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
        </div>
      </button>

      {/* Items */}
      {isExpanded && (
        <div className="divide-y divide-border/50 border-t border-border/50">
          {d.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onCycleItem(item.id)}
              className={cn(
                "px-4 py-2.5 flex items-start gap-3 w-full text-left transition-colors group",
                item.status === "missing" ? "bg-destructive/3 hover:bg-destructive/6"
                : item.status === "needs_attention" ? "bg-accent/3 hover:bg-accent/6"
                : "hover:bg-secondary/20",
              )}
              title={
                item.status === "missing" ? "Click to mark as Needs Attention"
                : item.status === "needs_attention" ? "Click to mark Complete"
                : "Click to mark as Needs Attention"
              }
            >
              <div className={cn(
                "size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors group-hover:scale-110",
                item.status === "complete" ? "border-success bg-success/15"
                : item.status === "needs_attention" ? "border-accent bg-accent/10"
                : "border-destructive bg-destructive/10",
              )}>
                {item.status === "complete"
                  ? <CheckCircle size={8} className="text-success" />
                  : item.status === "needs_attention"
                  ? <Clock size={8} className="text-accent" />
                  : <AlertTriangle size={8} className="text-destructive" />
                }
              </div>

              <div className="flex-1">
                <div className="text-[11px] font-medium leading-snug">{item.item}</div>
                {item.notes && (
                  <div className={cn(
                    "text-[10px] mt-0.5 leading-relaxed",
                    item.status === "missing" ? "text-destructive/80"
                    : item.status === "needs_attention" ? "text-accent/80"
                    : "text-muted-foreground",
                  )}>
                    {item.notes}
                  </div>
                )}
                {item.lastReviewed && item.status === "complete" && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Last reviewed: {item.lastReviewed}
                  </div>
                )}
              </div>

              <span className={cn(
                "text-[9px] px-1.5 py-0.5 rounded border font-medium shrink-0 transition-opacity group-hover:opacity-80",
                item.status === "complete" ? "bg-success/10 text-success border-success/20"
                : item.status === "needs_attention" ? "bg-accent/10 text-accent border-accent/20"
                : "bg-destructive/10 text-destructive border-destructive/20",
              )}>
                {item.status === "complete" ? "Complete"
                : item.status === "needs_attention" ? "Review"
                : "Missing"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={cn("font-mono text-xl font-bold mt-0.5", cls)}>{value}</div>
    </div>
  );
}
