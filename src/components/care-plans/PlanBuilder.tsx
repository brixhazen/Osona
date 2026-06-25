import { useState, useMemo } from "react";
import {
  Search, Plus, CheckCircle2, ChevronDown, ChevronUp,
  MoreHorizontal, AlertTriangle,
} from "lucide-react";
import {
  RESIDENTS, CLINICAL_DATA,
  type CarePlanProblem, type CareLevel,
} from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// ── Extended type (local only — clinical.ts is unchanged) ─────────────────────

type ExtendedCarePlanProblem = CarePlanProblem & {
  category?: string;
  priority?: "high" | "medium" | "low";
  discipline?: string;
};

type LocalCarePlan = Record<string, ExtendedCarePlanProblem[]>;

// ── Constants ─────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-06-24");

const CATEGORIES = [
  "Safety & Mobility",
  "Memory & Behavior",
  "Pain Management",
  "Cardiac",
  "Respiratory",
  "Endocrine",
  "Nutrition",
  "Skin & Wound",
  "General",
] as const;

const DISCIPLINES = [
  "RN", "LPN", "CNA", "PT", "OT", "Speech",
  "Dietary", "Social Services", "All Staff",
] as const;

const PRIORITY_COLORS: Record<string, string> = {
  high:   "bg-destructive/15 text-destructive border-destructive/25",
  medium: "bg-warning/15 text-warning border-warning/25",
  low:    "bg-muted/40 text-muted-foreground border-border",
};

const CATEGORY_BORDER_COLOR: Record<string, string> = {
  "Safety & Mobility": "hsl(var(--destructive))",
  "Memory & Behavior": "hsl(var(--warning))",
  "Pain Management":   "hsl(var(--accent-foreground))",
};

const AVATAR_BG: Record<CareLevel, string> = {
  memory_care: "bg-destructive/20 text-destructive",
  assisted:    "bg-primary/20 text-primary",
  independent: "bg-success/20 text-success",
};

const CARE_LABELS: Record<CareLevel, string> = {
  memory_care: "Memory Care",
  assisted:    "Assisted Living",
  independent: "Independent Living",
};

const CARE_COLORS: Record<CareLevel, string> = {
  memory_care: "bg-destructive/15 text-destructive border-destructive/25",
  assisted:    "bg-primary/15 text-primary border-primary/25",
  independent: "bg-success/15 text-success border-success/25",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveCategory(text: string): string {
  const t = text.toLowerCase();
  if (/fall|mobility|ambul/.test(t))              return "Safety & Mobility";
  if (/elopement|wander/.test(t))                 return "Memory & Behavior";
  if (/pain/.test(t))                             return "Pain Management";
  if (/glucose|diabet|insulin/.test(t))           return "Endocrine";
  if (/cardiac|heart|chf|blood pressure/.test(t)) return "Cardiac";
  if (/respiratory|copd|oxygen|o2/.test(t))       return "Respiratory";
  if (/nutrition|weight|diet/.test(t))            return "Nutrition";
  if (/skin|wound/.test(t))                       return "Skin & Wound";
  return "General";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  return Math.floor((TODAY.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function initPlans(): LocalCarePlan {
  return Object.fromEntries(
    Object.entries(CLINICAL_DATA).map(([id, d]) => [
      id,
      d.carePlan.map((p) => ({ ...p, interventions: [...p.interventions] })),
    ]),
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InterventionList({
  interventions,
  problemId,
}: {
  interventions: string[];
  problemId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 5;
  const visible = expanded ? interventions : interventions.slice(0, LIMIT);
  const hidden = interventions.length - LIMIT;

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Interventions ({interventions.length})
      </p>
      <ol className="space-y-1.5">
        {visible.map((intv, i) => (
          <li key={`${problemId}-${i}`} className="flex items-start gap-2 text-xs">
            <span className="shrink-0 w-4 h-4 rounded border border-border bg-muted/30 flex items-center justify-center text-[10px] font-mono text-muted-foreground mt-0.5">
              {i + 1}
            </span>
            <span className="leading-relaxed">{intv}</span>
          </li>
        ))}
      </ol>
      {interventions.length > LIMIT && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-[11px] text-primary hover:underline flex items-center gap-1"
        >
          {expanded ? (
            <><ChevronUp className="w-3 h-3" /> Show less</>
          ) : (
            <><ChevronDown className="w-3 h-3" /> Show {hidden} more</>
          )}
        </button>
      )}
    </div>
  );
}

function ProblemCard({
  problem: p,
  index,
  onResolve,
  compact = false,
}: {
  problem: ExtendedCarePlanProblem;
  index: number;
  onResolve?: () => void;
  compact?: boolean;
}) {
  const isResolved = p.status === "resolved";
  const category = p.category ?? deriveCategory(p.problem);
  const borderColor = CATEGORY_BORDER_COLOR[category] ?? "hsl(var(--primary))";
  const days = daysSince(p.lastReviewed);
  const reviewStatus = days > 90 ? "overdue" : days <= 30 ? "recent" : "ok";

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card border-l-4 overflow-hidden",
        compact && "opacity-60",
      )}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="p-5">
        {/* Card header */}
        <div className="flex items-start gap-3">
          <div className={cn(
            "shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-mono font-bold mt-0.5",
            isResolved
              ? "border-success/30 bg-success/10 text-success"
              : "border-primary/30 bg-primary/10 text-primary",
          )}>
            P{index}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-snug mb-1.5">{p.problem}</h4>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize",
                    isResolved
                      ? "bg-success/15 text-success border-success/25"
                      : "bg-primary/15 text-primary border-primary/25",
                  )}>
                    {p.status}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-muted/30">
                    {category}
                  </span>
                  {p.priority && (
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize",
                      PRIORITY_COLORS[p.priority],
                    )}>
                      {p.priority}
                    </span>
                  )}
                  {p.discipline && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-muted/30">
                      {p.discipline}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isResolved && onResolve && (
                  <button
                    onClick={onResolve}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-success border border-success/30 bg-success/10 hover:bg-success/20 transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    Resolve
                  </button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem className="text-xs cursor-pointer">Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs cursor-pointer">Print</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Card body — only shown in full (non-compact) mode */}
        {!compact && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Left: Goal + Related Dx */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Goal
                </p>
                <div className="rounded-md bg-primary/5 border border-primary/15 p-3">
                  <p className="text-xs leading-relaxed">{p.goal}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">Target: {p.targetDate}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Related Dx
                </p>
                <p className="text-xs text-foreground">{p.relatedDx}</p>
              </div>
            </div>

            {/* Right: Interventions */}
            <div>
              <InterventionList interventions={p.interventions} problemId={p.id} />
            </div>
          </div>
        )}

        {/* Card footer */}
        <div className={cn(
          "flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground border-t border-border pt-3",
          compact ? "mt-3" : "mt-4",
        )}>
          <span>Last reviewed: {formatDate(p.lastReviewed)}</span>
          <span className="text-border">·</span>
          <span>Due: {p.targetDate}</span>
          {reviewStatus === "overdue" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/25 text-[10px] font-medium">
              <AlertTriangle className="w-2.5 h-2.5" /> Review overdue
            </span>
          )}
          {reviewStatus === "recent" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/25 text-[10px] font-medium">
              ✓ Recently reviewed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  problem: "",
  goal: "",
  interventions: "",
  targetDate: "",
  relatedDx: "",
  category: "General" as string,
  priority: "medium" as "high" | "medium" | "low",
  discipline: "",
};

export function PlanBuilder() {
  const [plans, setPlans] = useState<LocalCarePlan>(initPlans);
  const [selectedId, setSelectedId] = useState(RESIDENTS[0].id);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resolvedOpen, setResolvedOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const selected = RESIDENTS.find((r) => r.id === selectedId) ?? RESIDENTS[0];

  const filteredResidents = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return RESIDENTS;
    return RESIDENTS.filter(
      (r) =>
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q) ||
        (r.preferredName ?? "").toLowerCase().includes(q),
    );
  }, [search]);

  const currentPlan = plans[selectedId] ?? [];
  const activeProblems = currentPlan.filter((p) => p.status === "active");
  const resolvedProblems = currentPlan.filter((p) => p.status === "resolved");

  const lastReviewed = useMemo(() => {
    const dates = currentPlan.map((p) => p.lastReviewed).filter(Boolean).sort();
    return dates.at(-1) ?? null;
  }, [currentPlan]);

  function handleAddProblem() {
    if (!form.problem.trim() || !form.goal.trim()) return;
    const newProblem: ExtendedCarePlanProblem = {
      id: `cp-new-${Date.now()}`,
      problem: form.problem.trim(),
      goal: form.goal.trim(),
      interventions: form.interventions.split("\n").map((s) => s.trim()).filter(Boolean),
      targetDate: form.targetDate || "TBD",
      status: "active",
      relatedDx: form.relatedDx.trim() || "Unspecified",
      lastReviewed: TODAY.toISOString().slice(0, 10),
      category: form.category,
      priority: form.priority,
      discipline: form.discipline || undefined,
    };
    setPlans((prev) => ({
      ...prev,
      [selectedId]: [newProblem, ...(prev[selectedId] ?? [])],
    }));
    setForm(DEFAULT_FORM);
    setSheetOpen(false);
  }

  function handleResolve(problemId: string) {
    setPlans((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] ?? []).map((p) =>
        p.id === problemId ? { ...p, status: "resolved" as const } : p,
      ),
    }));
  }

  const displayName = selected.preferredName
    ? `${selected.firstName} "${selected.preferredName}" ${selected.lastName}`
    : `${selected.firstName} ${selected.lastName}`;

  return (
    <div className="flex gap-5 h-[calc(100vh-11rem)]">
      {/* ── Left resident list ─────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col gap-3 overflow-hidden">
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search residents..."
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
          {filteredResidents.map((r) => {
            const name = r.preferredName
              ? `${r.preferredName} ${r.lastName}`
              : `${r.firstName} ${r.lastName}`;
            const initials = `${r.firstName[0]}${r.lastName[0]}`;
            const activeCount = (plans[r.id] ?? []).filter((p) => p.status === "active").length;

            return (
              <button
                key={r.id}
                onClick={() => { setSelectedId(r.id); setResolvedOpen(false); }}
                className={cn(
                  "w-full text-left rounded-lg border px-3 py-2.5 transition-all flex items-center gap-3",
                  r.id === selectedId
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-card hover:border-primary/30 hover:bg-muted/30",
                )}
              >
                <div className={cn(
                  "shrink-0 size-8 rounded-full flex items-center justify-center text-xs font-bold",
                  AVATAR_BG[r.careLevel],
                )}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{r.room}</div>
                </div>
                <span className={cn(
                  "shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium border",
                  activeCount > 0
                    ? "bg-primary/15 text-primary border-primary/25"
                    : "bg-muted/40 text-muted-foreground border-border",
                )}>
                  {activeCount} active
                </span>
              </button>
            );
          })}
          {filteredResidents.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">No residents match.</p>
          )}
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto space-y-4">
        {/* Resident header */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display font-bold text-lg leading-tight">{displayName}</h2>
              <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-muted-foreground">
                <span className="font-mono">{selected.room}</span>
                <span className="text-border">·</span>
                <span>{selected.physician}</span>
                <span className="text-border">·</span>
                <span className="truncate max-w-[260px]">{selected.primaryDx[0]}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span className={cn("text-[11px] px-2 py-0.5 rounded border font-medium", CARE_COLORS[selected.careLevel])}>
                {CARE_LABELS[selected.careLevel]}
              </span>
              <button
                onClick={() => setSheetOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={13} />
                Add Problem
              </button>
            </div>
          </div>

          {/* Stat chips */}
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-medium">
              {activeProblems.length} Active Problem{activeProblems.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-muted-foreground text-xs">
              {resolvedProblems.length} Resolved
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-muted-foreground text-xs">
              Last reviewed: {lastReviewed ? formatDate(lastReviewed) : "Never"}
            </span>
          </div>
        </div>

        {/* Active problem cards */}
        {activeProblems.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-10 text-center">
            <p className="text-sm text-muted-foreground">No active care plan problems documented.</p>
          </div>
        )}
        {activeProblems.map((p, i) => (
          <ProblemCard
            key={p.id}
            problem={p}
            index={i + 1}
            onResolve={() => handleResolve(p.id)}
          />
        ))}

        {/* Resolved section (collapsible) */}
        {resolvedProblems.length > 0 && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <button
              onClick={() => setResolvedOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <span>Resolved Problems ({resolvedProblems.length})</span>
              {resolvedOpen
                ? <ChevronUp className="w-4 h-4" />
                : <ChevronDown className="w-4 h-4" />
              }
            </button>
            {resolvedOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                {resolvedProblems.map((p, i) => (
                  <ProblemCard
                    key={p.id}
                    problem={p}
                    index={activeProblems.length + i + 1}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add Problem Sheet ───────────────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[500px] bg-card border-l border-border overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Add Care Plan Problem</SheetTitle>
            <SheetDescription>
              {displayName} · Room {selected.room}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <FormField label="Problem Statement" required>
              <input
                value={form.problem}
                onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))}
                placeholder="e.g. Impaired mobility related to hip fracture"
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label="Related Diagnosis">
              <input
                value={form.relatedDx}
                onChange={(e) => setForm((f) => ({ ...f, relatedDx: e.target.value }))}
                placeholder="e.g. Hip fracture S72.001A"
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label="Goal" required>
              <textarea
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                placeholder="Measurable, resident-centered goal..."
                rows={3}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </FormField>

            <FormField label="Interventions" hint="one per line">
              <textarea
                value={form.interventions}
                onChange={(e) => setForm((f) => ({ ...f, interventions: e.target.value }))}
                placeholder={"Assist with transfer using gait belt\nPT/OT three times weekly\nMonitor for pain with movement"}
                rows={4}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </FormField>

            <FormField label="Target Date">
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Category">
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Priority">
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as "high" | "medium" | "low" }))}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </FormField>
            </div>

            <FormField label="Assigned Discipline">
              <select
                value={form.discipline}
                onChange={(e) => setForm((f) => ({ ...f, discipline: e.target.value }))}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">— Optional —</option>
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FormField>

            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={() => { setSheetOpen(false); setForm(DEFAULT_FORM); }}
                className="flex-1 px-3 py-2 rounded text-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProblem}
                disabled={!form.problem.trim() || !form.goal.trim()}
                className="flex-1 px-3 py-2 rounded text-sm bg-primary text-primary-foreground font-medium disabled:opacity-40"
              >
                Add to Care Plan
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FormField({
  label, required, hint, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {hint && <span className="font-normal normal-case ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  );
}
