import { useState } from "react";
import { Circle, Plus, CheckCircle2 } from "lucide-react";
import { type Resident, type ResidentClinicalData, type CarePlanProblem } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Props {
  resident: Resident;
  data: ResidentClinicalData;
  onAddProblem: (p: CarePlanProblem) => void;
  onResolveProblem: (id: string) => void;
}

export function CarePlanTab({ resident, data, onAddProblem, onResolveProblem }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({
    problem: "",
    goal: "",
    interventions: "",
    targetDate: "",
    relatedDx: "",
  });

  function handleSave() {
    if (!form.problem.trim() || !form.goal.trim()) return;
    const newProblem: CarePlanProblem = {
      id: `cp-new-${Date.now()}`,
      problem: form.problem.trim(),
      goal: form.goal.trim(),
      interventions: form.interventions.split("\n").map((s) => s.trim()).filter(Boolean),
      targetDate: form.targetDate || "TBD",
      status: "active",
      relatedDx: form.relatedDx.trim() || "Unspecified",
      lastReviewed: new Date().toISOString().slice(0, 10),
    };
    onAddProblem(newProblem);
    setForm({ problem: "", goal: "", interventions: "", targetDate: "", relatedDx: "" });
    setSheetOpen(false);
  }

  const active = data.carePlan.filter((p) => p.status === "active");
  const resolved = data.carePlan.filter((p) => p.status === "resolved");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {active.length} active problem{active.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium"
        >
          <Plus size={13} />
          Add Problem
        </button>
      </div>

      {active.map((p, i) => (
        <CarePlanCard key={p.id} problem={p} index={i + 1} onResolve={() => onResolveProblem(p.id)} />
      ))}

      {resolved.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pt-2">Resolved</p>
          {resolved.map((p, i) => (
            <CarePlanCard key={p.id} problem={p} index={active.length + i + 1} />
          ))}
        </>
      )}

      {data.carePlan.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No care plan problems documented.</p>
      )}

      {/* Add Problem Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[480px] bg-card border-l border-border overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Add Care Plan Problem</SheetTitle>
            <SheetDescription>
              {resident.firstName} {resident.lastName} · Room {resident.room}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Problem Statement <span className="text-destructive">*</span></label>
              <input
                value={form.problem}
                onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))}
                placeholder="e.g. Impaired mobility related to hip fracture"
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Related Diagnosis</label>
              <input
                value={form.relatedDx}
                onChange={(e) => setForm((f) => ({ ...f, relatedDx: e.target.value }))}
                placeholder="e.g. Hip fracture S72.001A"
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Goal <span className="text-destructive">*</span></label>
              <textarea
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                placeholder="Measurable, resident-centered goal..."
                rows={3}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Interventions <span className="text-muted-foreground font-normal">(one per line)</span>
              </label>
              <textarea
                value={form.interventions}
                onChange={(e) => setForm((f) => ({ ...f, interventions: e.target.value }))}
                placeholder={"Assist with transfer using gait belt\nPT/OT three times weekly\nMonitor for pain with movement"}
                rows={4}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Target Date</label>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setSheetOpen(false)}
                className="flex-1 px-3 py-2 rounded text-sm border border-border text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
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

function CarePlanCard({
  problem: p, index, onResolve,
}: {
  problem: CarePlanProblem; index: number; onResolve?: () => void;
}) {
  const isResolved = p.status === "resolved";

  return (
    <div className={cn("rounded-lg border p-4", isResolved ? "border-border bg-surface/40 opacity-70" : "border-border bg-surface")}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-mono font-bold",
          isResolved
            ? "border-success/30 bg-success/10 text-success"
            : "border-primary/30 bg-primary/10 text-primary",
        )}>
          {index}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h4 className="font-semibold text-sm leading-snug">{p.problem}</h4>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize",
                isResolved
                  ? "bg-success/15 text-success border-success/25"
                  : "bg-primary/15 text-primary border-primary/25",
              )}>
                {p.status}
              </span>
              {!isResolved && onResolve && (
                <button
                  onClick={onResolve}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-success border border-success/30 bg-success/10 hover:bg-success/20 transition-colors"
                >
                  <CheckCircle2 size={11} />
                  Resolve
                </button>
              )}
            </div>
          </div>

          <div className="rounded-md bg-surface-2/40 border border-border p-3 mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Goal</p>
            <p className="text-xs leading-relaxed">{p.goal}</p>
          </div>

          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Interventions</p>
            <ul className="space-y-1.5">
              {p.interventions.map((intv, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <Circle className="w-2.5 h-2.5 shrink-0 mt-0.5 text-primary/40" />
                  <span className="leading-relaxed">{intv}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-4 pt-3 border-t border-border text-[11px] text-muted-foreground flex-wrap">
            <span>Dx: {p.relatedDx}</span>
            <span>Target: {p.targetDate}</span>
            <span>Last reviewed: {p.lastReviewed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
