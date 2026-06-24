import { useState } from "react";
import {
  PRIORITY_CONFIG, STATUS_CONFIG, CATEGORY_CONFIG,
  type WorkOrder, type WorkOrderPriority, type WorkOrderCategory, type WorkOrderStatus,
} from "@/lib/mock/maintenance";
import { cn } from "@/lib/utils";
import {
  AlertTriangle, CheckCircle, Clock, User, Wrench, X,
  MapPin, Calendar, ChevronRight, Plus,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const TECHNICIANS = [
  "Dave Hensley",
  "Comfort Air Systems",
  "Blue Ridge Plumbing",
  "Precision Electric",
  "Mountain West Elevator Co.",
  "Alpine Grounds & Exterior",
];

const CATEGORIES = [
  "safety", "plumbing", "electrical", "hvac", "carpentry", "technology", "painting", "grounds",
] as const;

type PriorityFilter = "all" | WorkOrderPriority;
type CategoryFilter = "all" | WorkOrderCategory;

const WORKFLOW_STEPS: { label: string }[] = [
  { label: "Reported" },
  { label: "Assigned" },
  { label: "In Progress" },
  { label: "Completed" },
];

function getWorkflowStep(status: WorkOrderStatus): number {
  if (status === "open" || status === "scheduled") return 0;
  if (status === "assigned") return 1;
  if (status === "in_progress" || status === "parts_ordered" || status === "vendor_called") return 2;
  if (status === "completed") return 3;
  return 0;
}

interface Props {
  workOrders: WorkOrder[];
  onAssign: (id: string, assignee: string, estimatedHours: number | null) => void;
  onAdvanceStatus: (id: string) => void;
  onCallVendor: (id: string) => void;
  onComplete: (id: string, actualHours: number, notes: string) => void;
  onAddWorkOrder: (wo: Omit<WorkOrder, "id">) => void;
}

export function WorkOrders({ workOrders, onAssign, onAdvanceStatus, onCallVendor, onComplete, onAddWorkOrder }: Props) {
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const selected = workOrders.find((wo) => wo.id === selectedId) ?? null;

  const PRIORITY_ORDER: Record<WorkOrderPriority, number> = { emergency: 0, urgent: 1, standard: 2, scheduled: 3 };
  const sorted = workOrders
    .filter((wo) => {
      if (priority !== "all" && wo.priority !== priority) return false;
      if (category !== "all" && wo.category !== category) return false;
      return true;
    })
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              {(["all", "emergency", "urgent", "standard", "scheduled"] as PriorityFilter[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                    priority === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p === "all" ? "All" : PRIORITY_CONFIG[p].label}
                  <span className="ml-1.5 font-mono opacity-60">
                    {p === "all" ? workOrders.length : workOrders.filter((w) => w.priority === p).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["all", ...CATEGORIES] as CategoryFilter[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "h-7 px-3 rounded-full text-xs font-medium border transition-colors",
                    category === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c === "all" ? "All Categories" : CATEGORY_CONFIG[c as WorkOrderCategory]?.label ?? c}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="h-7 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus size={12} />
            New Work Order
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {sorted.map((wo) => (
            <WorkOrderCard key={wo.id} wo={wo} onSelect={() => setSelectedId(wo.id)} />
          ))}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-[520px] bg-card border-l border-border overflow-y-auto p-0">
          {selected && (
            <WorkOrderDetail
              wo={selected}
              onClose={() => setSelectedId(null)}
              onAssign={(assignee, hrs) => onAssign(selected.id, assignee, hrs)}
              onAdvanceStatus={() => onAdvanceStatus(selected.id)}
              onCallVendor={() => onCallVendor(selected.id)}
              onComplete={(hrs, notes) => onComplete(selected.id, hrs, notes)}
            />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={showNew} onOpenChange={(o) => !o && setShowNew(false)}>
        <SheetContent side="right" className="w-[520px] bg-card border-l border-border overflow-y-auto p-0">
          <NewWorkOrderForm
            onClose={() => setShowNew(false)}
            onSubmit={(data) => { onAddWorkOrder(data); setShowNew(false); }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

function WorkOrderCard({ wo, onSelect }: { wo: WorkOrder; onSelect: () => void }) {
  const pri = PRIORITY_CONFIG[wo.priority];
  const stat = STATUS_CONFIG[wo.status];
  const isEmergency = wo.priority === "emergency";
  const isUrgent = wo.priority === "urgent";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-lg border bg-card p-3.5 flex items-start gap-3 border-l-4 transition-colors hover:bg-secondary/20",
        isEmergency ? "border-l-destructive border-destructive/20 bg-destructive/3"
        : isUrgent ? "border-l-accent border-accent/15"
        : "border-l-transparent",
      )}
    >
      <div className={cn("size-2.5 rounded-full shrink-0 mt-1.5", pri.dot)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-[10px] text-muted-foreground">{wo.id}</span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", pri.color)}>{pri.label}</span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", stat.color)}>{stat.label}</span>
          {wo.safetyFlag && (
            <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded border border-destructive/30 bg-destructive/10 text-destructive font-medium">
              <AlertTriangle size={8} />
              Safety
            </span>
          )}
        </div>
        <div className="text-sm font-medium leading-tight">{wo.title}</div>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={9} />
            {wo.location.split(",")[0]}
          </span>
          {wo.residentName && (
            <span className="flex items-center gap-1">
              <User size={9} />
              {wo.residentName} · {wo.residentRoom}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={9} />
            {wo.reportedDate.slice(5).replace("-", "/")}
          </span>
          {wo.assignedTo
            ? <span>{wo.assignedTo}</span>
            : <span className="text-destructive font-medium">Unassigned</span>
          }
        </div>
      </div>
      <ChevronRight size={14} className="text-muted-foreground shrink-0 mt-1" />
    </button>
  );
}

interface DetailProps {
  wo: WorkOrder;
  onClose: () => void;
  onAssign: (assignee: string, estimatedHours: number | null) => void;
  onAdvanceStatus: () => void;
  onCallVendor: () => void;
  onComplete: (actualHours: number, notes: string) => void;
}

function WorkOrderDetail({ wo, onClose, onAssign, onAdvanceStatus, onCallVendor, onComplete }: DetailProps) {
  const pri = PRIORITY_CONFIG[wo.priority];
  const stat = STATUS_CONFIG[wo.status];
  const currentStep = getWorkflowStep(wo.status);

  const [assigning, setAssigning] = useState(false);
  const [assignee, setAssignee] = useState(TECHNICIANS[0]);
  const [estHoursStr, setEstHoursStr] = useState("");

  const [completing, setCompleting] = useState(false);
  const [actualHoursStr, setActualHoursStr] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");

  function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignee) return;
    const hrs = estHoursStr ? parseFloat(estHoursStr) : null;
    onAssign(assignee, hrs);
    setAssigning(false);
  }

  function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    const hrs = parseFloat(actualHoursStr);
    if (isNaN(hrs) || hrs <= 0) return;
    onComplete(hrs, completionNotes);
    setCompleting(false);
  }

  const canAssign = wo.status === "open" || wo.status === "scheduled";
  const canAdvance = wo.status === "assigned" || wo.status === "scheduled";
  const canComplete = wo.status === "in_progress" || wo.status === "vendor_called" || wo.status === "parts_ordered";
  const isCompleted = wo.status === "completed";

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] text-muted-foreground">{wo.id}</span>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", pri.color)}>{pri.label}</span>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", stat.color)}>{stat.label}</span>
            </div>
            <SheetTitle className="text-base font-semibold leading-tight">{wo.title}</SheetTitle>
            <SheetDescription className="text-[11px] text-muted-foreground mt-0.5">{wo.location}</SheetDescription>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground shrink-0">
            <X size={14} />
          </button>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {wo.safetyFlag && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-destructive/8 border border-destructive/25 text-[11px]">
            <AlertTriangle size={12} className="text-destructive shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-destructive">Safety Flag — </span>
              <span className="text-foreground/80">
                {wo.residentName
                  ? `Linked to resident ${wo.residentName} (${wo.residentRoom}).`
                  : "This location has an active safety concern."}
              </span>
            </div>
          </div>
        )}

        {wo.status !== "scheduled" && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Progress</div>
            <div className="flex items-center">
              {WORKFLOW_STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        "size-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                        done ? "bg-success/15 border-success/30 text-success"
                        : active ? "bg-primary/15 border-primary/30 text-primary"
                        : "bg-muted border-border text-muted-foreground",
                      )}>
                        {done ? <CheckCircle size={12} /> : i + 1}
                      </div>
                      <div className={cn(
                        "text-[9px] whitespace-nowrap",
                        done ? "text-success" : active ? "text-primary" : "text-muted-foreground",
                      )}>
                        {step.label}
                      </div>
                    </div>
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <div className={cn("flex-1 h-px mx-1 mb-4", done ? "bg-success/40" : "bg-border")} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DetailSection label="Description">
          <p className="text-[11px] text-foreground/80 leading-relaxed">{wo.description}</p>
        </DetailSection>

        <div className="grid grid-cols-2 gap-3">
          <DetailSection label="Reported By">
            <p className="text-xs">{wo.reportedBy}</p>
            <p className="text-[10px] text-muted-foreground">{wo.reportedDate}</p>
          </DetailSection>
          <DetailSection label="Assigned To">
            {wo.assignedTo
              ? <p className="text-xs">{wo.assignedTo}</p>
              : <p className="text-xs text-destructive font-medium">Unassigned</p>
            }
          </DetailSection>
          <DetailSection label="Category">
            <p className="text-xs">{CATEGORY_CONFIG[wo.category]?.label ?? wo.category}</p>
          </DetailSection>
          <DetailSection label="Hours">
            <p className="text-xs font-mono">
              {wo.estimatedHours !== null ? `${wo.estimatedHours}h est.` : "—"}
              {wo.actualHours !== null ? ` · ${wo.actualHours}h actual` : ""}
            </p>
          </DetailSection>
        </div>

        {wo.residentName && (
          <DetailSection label="Resident">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                {wo.residentName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="text-xs font-medium">{wo.residentName}</div>
                <div className="text-[10px] text-muted-foreground">Room {wo.residentRoom}</div>
              </div>
            </div>
          </DetailSection>
        )}

        {wo.notes && (
          <DetailSection label="Notes">
            <p className="text-[11px] text-foreground/80 leading-relaxed">{wo.notes}</p>
          </DetailSection>
        )}

        {isCompleted && wo.completedDate && (
          <div className="flex items-center gap-1.5 text-success text-xs">
            <CheckCircle size={12} />
            Completed {wo.completedDate}
          </div>
        )}

        {/* Actions */}
        {!isCompleted && (
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {/* Assign form */}
            {canAssign && !assigning && (
              <button
                onClick={() => setAssigning(true)}
                className="w-full py-2 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/15 transition-colors"
              >
                {wo.assignedTo ? "Reassign" : "Assign & Schedule"}
              </button>
            )}
            {canAssign && assigning && (
              <form onSubmit={handleAssign} className="rounded-md border border-border bg-secondary/30 p-3 flex flex-col gap-2.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Assign Work Order</div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Technician / Vendor</div>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full h-7 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {TECHNICIANS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Estimated Hours (optional)</div>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={estHoursStr}
                    onChange={(e) => setEstHoursStr(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full h-7 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAssigning(false)}
                    className="flex-1 h-7 rounded border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-7 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </form>
            )}

            {/* Advance status */}
            {canAdvance && (
              <button
                onClick={onAdvanceStatus}
                className="w-full py-2 rounded-md bg-accent/10 border border-accent/20 text-accent text-xs font-medium hover:bg-accent/15 transition-colors"
              >
                Mark In Progress →
              </button>
            )}

            {/* Complete form */}
            {canComplete && !completing && (
              <button
                onClick={() => setCompleting(true)}
                className="w-full py-2 rounded-md bg-success/10 border border-success/20 text-success text-xs font-medium hover:bg-success/15 transition-colors"
              >
                Mark Complete
              </button>
            )}
            {canComplete && completing && (
              <form onSubmit={handleComplete} className="rounded-md border border-border bg-secondary/30 p-3 flex flex-col gap-2.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Complete Work Order</div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Actual Hours *</div>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    required
                    value={actualHoursStr}
                    onChange={(e) => setActualHoursStr(e.target.value)}
                    placeholder="e.g. 1.5"
                    autoFocus
                    className="w-full h-7 rounded border border-border bg-background px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Completion Notes (optional)</div>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    rows={2}
                    placeholder="What was done, parts used, follow-up needed..."
                    className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCompleting(false)}
                    className="flex-1 h-7 rounded border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-7 rounded bg-success text-white text-xs font-medium hover:bg-success/90 transition-colors"
                  >
                    Complete
                  </button>
                </div>
              </form>
            )}

            {/* Call vendor (emergency) */}
            {wo.priority === "emergency" && wo.status !== "vendor_called" && (
              <button
                onClick={onCallVendor}
                className="w-full py-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium hover:bg-destructive/15 transition-colors"
              >
                Escalate / Call Vendor
              </button>
            )}
            {wo.status === "vendor_called" && (
              <div className="flex items-center gap-1.5 justify-center text-[11px] text-muted-foreground py-1">
                <Clock size={11} />
                Vendor called — awaiting response
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NewWorkOrderForm({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: Omit<WorkOrder, "id">) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<WorkOrderPriority>("standard");
  const [category, setCategory] = useState<WorkOrderCategory>("safety");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [reportedBy, setReportedBy] = useState("Maintenance Staff");
  const [assignedTo, setAssignedTo] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [residentRoom, setResidentRoom] = useState("");
  const [residentName, setResidentName] = useState("");
  const [safetyFlag, setSafetyFlag] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;
    onSubmit({
      priority,
      status: "open",
      category,
      title: title.trim(),
      location: location.trim(),
      description: description.trim(),
      reportedBy: reportedBy.trim() || "Maintenance Staff",
      reportedDate: "2026-06-05",
      assignedTo: assignedTo || null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
      actualHours: null,
      completedDate: null,
      residentRoom: residentRoom.trim() || null,
      residentName: residentName.trim() || null,
      safetyFlag,
      vendorId: null,
      notes: null,
    });
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div>
            <SheetTitle className="text-base font-semibold">New Work Order</SheetTitle>
            <SheetDescription className="text-[11px] text-muted-foreground mt-0.5">Create a maintenance request</SheetDescription>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary text-muted-foreground shrink-0">
            <X size={14} />
          </button>
        </div>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        <FormField label="Title *">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Leaking faucet in Room 204"
            required
            className="w-full h-8 rounded border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}
              className="w-full h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {(["emergency", "urgent", "standard", "scheduled"] as WorkOrderPriority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WorkOrderCategory)}
              className="w-full h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_CONFIG[c]?.label ?? c}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Location *">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Room 204, Dining Room, Main Lobby"
            required
            className="w-full h-8 rounded border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the issue in detail..."
            className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Reported By">
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full h-8 rounded border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField label="Assign To">
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full h-8 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Unassigned</option>
              {TECHNICIANS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Estimated Hours">
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="100"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="e.g. 2"
            className="w-full h-8 rounded border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Resident Name (optional)">
            <input
              type="text"
              value={residentName}
              onChange={(e) => setResidentName(e.target.value)}
              className="w-full h-8 rounded border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField label="Room (optional)">
            <input
              type="text"
              value={residentRoom}
              onChange={(e) => setResidentRoom(e.target.value)}
              className="w-full h-8 rounded border border-border bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={safetyFlag}
            onChange={(e) => setSafetyFlag(e.target.checked)}
            className="size-3.5 rounded border-border"
          />
          <span className="text-xs text-foreground">Safety flag — marks this as a safety-related issue</span>
        </label>

        <div className="flex gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-8 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 h-8 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            Create Work Order
          </button>
        </div>
      </form>
    </div>
  );
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      {children}
    </div>
  );
}
