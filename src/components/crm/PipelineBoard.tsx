import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  PIPELINE_STAGES,
  STAGE_CONFIG,
  STAGE_OUTREACH_TEMPLATES,
  URGENCY_CONFIG,
  CARE_LABELS,
  CARE_COLORS,
  SOURCE_LABELS,
  RATE_ESTIMATES,
  type Lead,
  type LeadStage,
  type Activity,
  type ActivityType,
} from "@/lib/mock/crm";
import { cn } from "@/lib/utils";
import { AlertTriangle, Calendar, PhoneCall, Check, X, MessageSquare, Mail, Send } from "lucide-react";

interface Props {
  leads: Lead[];
  wonThisQuarter: number;
  lostThisQuarter: number;
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
  onAddActivity: (leadId: string, act: Activity) => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  onOpenLost: () => void;
  onOpenMovedIn: () => void;
}

type OutreachChannel = "text" | "email";

const TODAY = new Date().toISOString().slice(0, 10);

function isFollowUpOverdue(lead: Lead): boolean {
  if (!lead.followUpDate) return false;
  return new Date(lead.followUpDate + "T00:00:00") < new Date(TODAY + "T00:00:00");
}

function daysInPipeline(lead: Lead): number {
  const d = new Date(lead.createdAt + "T00:00:00");
  const today = new Date(TODAY + "T00:00:00");
  return Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const QUICK_LOG_TYPES: { value: ActivityType; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "note", label: "Note" },
];

export function PipelineBoard({ leads, wonThisQuarter, lostThisQuarter, selectedLeadId, onSelectLead, onAddActivity, onUpdateLead, onOpenLost, onOpenMovedIn }: Props) {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveLead(leads.find((l) => l.id === (event.active.id as string)) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveLead(null);
    if (!over) return;
    const leadId = active.id as string;
    const newStage = over.id as LeadStage;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage) return;
    onUpdateLead(leadId, { stage: newStage });
    onAddActivity(leadId, {
      id: `act-drag-${Date.now()}`,
      type: "note",
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      by: "Current User",
      subject: `Stage changed to ${STAGE_CONFIG[newStage].label}`,
      body: `Moved from ${STAGE_CONFIG[lead.stage].label}`,
    });
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenMovedIn}
            className="flex items-center gap-2 text-xs group hover:opacity-80 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-success font-medium group-hover:underline underline-offset-2">
              {wonThisQuarter} moved in
            </span>
            <span className="text-muted-foreground">this quarter</span>
          </button>
          <div className="h-3 w-px bg-border" />
          <button
            onClick={onOpenLost}
            className="flex items-center gap-2 text-xs group hover:opacity-80 transition-opacity"
          >
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-destructive font-medium group-hover:underline underline-offset-2">
              {lostThisQuarter} lost
            </span>
            <span className="text-muted-foreground">this quarter</span>
          </button>
          <span className="ml-auto text-[11px] text-muted-foreground/60 italic hidden lg:block">
            Drag cards between columns · click to open
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads
              .filter((l) => l.stage === stage)
              .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

            return (
              <DroppableColumn
                key={stage}
                stage={stage}
                stageLeads={stageLeads}
                selectedLeadId={selectedLeadId}
                onSelectLead={onSelectLead}
                onAddActivity={onAddActivity}
                onUpdateLead={onUpdateLead}
              />
            );
          })}
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
        {activeLead && <LeadCardOverlay lead={activeLead} />}
      </DragOverlay>
    </DndContext>
  );
}

function DroppableColumn({
  stage, stageLeads, selectedLeadId, onSelectLead, onAddActivity, onUpdateLead,
}: {
  stage: LeadStage;
  stageLeads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
  onAddActivity: (leadId: string, act: Activity) => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const cfg = STAGE_CONFIG[stage];
  const stageRevenue = stageLeads.reduce((sum, l) => sum + RATE_ESTIMATES[l.careInterest], 0);

  const [outboxOpen, setOutboxOpen] = useState(false);
  const [channel, setChannel] = useState<OutreachChannel>("text");
  const [unselected, setUnselected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState(STAGE_OUTREACH_TEMPLATES[stage] ?? "");
  const [sent, setSent] = useState(false);

  const activeLeads = stageLeads.filter((l) =>
    channel === "email"
      ? !!l.primaryContact.email
      : !!l.primaryContact.phone,
  );
  const noContactLeads = stageLeads.filter((l) =>
    channel === "email" ? !l.primaryContact.email : !l.primaryContact.phone,
  );
  const selectedCount = activeLeads.filter((l) => !unselected.has(l.id)).length;

  function toggleLead(id: string) {
    setUnselected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openOutbox() {
    setOutboxOpen(true);
    setSent(false);
    setUnselected(new Set());
    setMessage(STAGE_OUTREACH_TEMPLATES[stage] ?? "");
  }

  function handleSend() {
    const now = new Date();
    const twoWeeksOut = new Date(now.getTime() + 14 * 86_400_000).toISOString().slice(0, 10);
    for (const lead of activeLeads) {
      if (unselected.has(lead.id)) continue;
      const personalized = message.replace(/\{\{firstName\}\}/g, lead.firstName);
      onAddActivity(lead.id, {
        id: `act-mass-${Date.now()}-${lead.id}`,
        type: channel === "text" ? "call" : "email",
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5),
        by: "Current User",
        subject: `Mass ${channel} — ${cfg.label} outreach`,
        body: personalized,
      });
      onUpdateLead(lead.id, { followUpDate: twoWeeksOut });
    }
    setSent(true);
    setTimeout(() => {
      setOutboxOpen(false);
      setSent(false);
    }, 1800);
  }

  return (
    <div className="min-w-[240px] flex flex-col gap-2">
      {/* Column header */}
      <div className={cn(
        "rounded-lg border px-3 py-2.5 flex items-center justify-between transition-all duration-150",
        isOver ? "border-primary/50 bg-primary/10 scale-[1.01]" : cfg.headerCls,
      )}>
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dotCls)} />
          <span className="font-semibold text-sm">{cfg.label}</span>
        </div>
        <span className="font-mono text-sm font-bold">{stageLeads.length}</span>
      </div>

      {stageRevenue > 0 && (
        <div className="text-[10px] text-muted-foreground font-mono px-1">
          ${(stageRevenue / 1000).toFixed(1)}k /mo potential
        </div>
      )}

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "space-y-2 flex-1 rounded-lg min-h-[80px] max-h-[calc(100vh-340px)] overflow-y-auto p-1 transition-all duration-150",
          isOver && "ring-2 ring-primary/30 bg-primary/5",
        )}
      >
        {stageLeads.map((lead) => (
          <DraggableLeadCard
            key={lead.id}
            lead={lead}
            selected={lead.id === selectedLeadId}
            onSelect={onSelectLead}
            onAddActivity={onAddActivity}
          />
        ))}
        {stageLeads.length === 0 && (
          <div className={cn(
            "rounded-lg border border-dashed px-3 py-6 text-center text-[11px] transition-all duration-150",
            isOver
              ? "border-primary/50 bg-primary/10 text-primary font-medium"
              : "border-border text-muted-foreground",
          )}>
            {isOver ? "↓ Drop here" : "No leads"}
          </div>
        )}
      </div>

      {/* Outreach footer */}
      {stageLeads.length > 0 && (
        <div className="border-t border-border/60 pt-2">
          {!outboxOpen ? (
            <button
              onClick={openOutbox}
              className="flex items-center justify-center gap-1.5 w-full text-[11px] py-1.5 rounded border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              <Send size={11} />
              Send Text / Email
            </button>
          ) : (
            <div className="rounded-lg border border-border bg-card p-3 space-y-2.5">
              {/* Sent confirmation */}
              {sent ? (
                <div className="flex items-center justify-center gap-2 py-3 text-success text-xs font-medium">
                  <Check size={13} />
                  Sent to {selectedCount} contact{selectedCount !== 1 ? "s" : ""}
                </div>
              ) : (
                <>
                  {/* Channel toggle */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { setChannel("text"); setUnselected(new Set()); }}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-colors flex-1 justify-center",
                        channel === "text" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <MessageSquare size={10} /> Text
                    </button>
                    <button
                      onClick={() => { setChannel("email"); setUnselected(new Set()); }}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-colors flex-1 justify-center",
                        channel === "email" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Mail size={10} /> Email
                    </button>
                  </div>

                  {/* Recipient list */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Recipients ({selectedCount} of {activeLeads.length})
                    </div>
                    <div className="max-h-[120px] overflow-y-auto space-y-1">
                      {activeLeads.map((lead) => {
                        const isSelected = !unselected.has(lead.id);
                        const contact = channel === "text"
                          ? lead.primaryContact.phone
                          : lead.primaryContact.email;
                        return (
                          <button
                            key={lead.id}
                            onClick={() => toggleLead(lead.id)}
                            className={cn(
                              "flex items-center gap-2 w-full text-left px-2 py-1 rounded border text-[10px] transition-colors",
                              isSelected
                                ? "border-primary/25 bg-primary/5 text-foreground"
                                : "border-border bg-muted/10 text-muted-foreground line-through",
                            )}
                          >
                            <div className={cn(
                              "size-3 rounded border flex items-center justify-center shrink-0",
                              isSelected ? "bg-primary border-primary" : "border-muted-foreground",
                            )}>
                              {isSelected && <Check size={8} className="text-primary-foreground" />}
                            </div>
                            <span className="font-medium truncate">{lead.firstName} {lead.lastName}</span>
                            <span className="text-muted-foreground truncate ml-auto shrink-0">{contact}</span>
                          </button>
                        );
                      })}
                      {noContactLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="flex items-center gap-2 px-2 py-1 rounded border border-border bg-muted/5 text-[10px] text-muted-foreground/50 opacity-50"
                        >
                          <div className="size-3 rounded border border-muted-foreground/30 shrink-0" />
                          <span className="truncate">{lead.firstName} {lead.lastName}</span>
                          <span className="ml-auto shrink-0 italic">no {channel}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Message</div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full rounded border border-border bg-background px-2 py-1.5 text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                    />
                    <div className="text-[9px] text-muted-foreground/60 mt-0.5">
                      {"{{firstName}}"} is replaced with each recipient's first name
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setOutboxOpen(false)}
                      className="px-2.5 py-1 rounded text-[11px] border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={selectedCount === 0 || !message.trim()}
                      className="flex items-center gap-1 flex-1 justify-center px-2.5 py-1 rounded text-[11px] bg-primary text-primary-foreground font-medium disabled:opacity-40 transition-opacity"
                    >
                      <Send size={10} />
                      Send to {selectedCount}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DraggableLeadCard({
  lead, selected, onSelect, onAddActivity,
}: {
  lead: Lead;
  selected: boolean;
  onSelect: (id: string) => void;
  onAddActivity: (leadId: string, act: Activity) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [logType, setLogType] = useState<ActivityType>("call");
  const [logSubject, setLogSubject] = useState("");
  const [logBody, setLogBody] = useState("");

  const urgCfg = URGENCY_CONFIG[lead.urgency];
  const days = daysInPipeline(lead);
  const initials = lead.assignedTo.split(" ").map((p) => p[0]).join("");

  function saveQuickLog(e: React.MouseEvent) {
    e.stopPropagation();
    if (!logSubject.trim()) return;
    const now = new Date();
    onAddActivity(lead.id, {
      id: `act-ql-${Date.now()}`,
      type: logType,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      by: "Current User",
      subject: logSubject.trim(),
      body: logBody.trim(),
    });
    setLogSubject("");
    setLogBody("");
    setLogType("call");
    setQuickLogOpen(false);
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-lg border select-none transition-all duration-150 cursor-grab active:cursor-grabbing",
        isDragging
          ? "opacity-30 scale-95 shadow-none"
          : cn(
              "hover:-translate-y-0.5 hover:shadow-md",
              selected
                ? "bg-primary/10 border-primary/40 hover:border-primary/60"
                : "bg-card border-border hover:border-primary/30 hover:bg-surface",
            ),
      )}
    >
      {/* Clickable card body */}
      <button
        onClick={() => onSelect(lead.id)}
        className="w-full text-left p-3 cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">
              {lead.firstName} {lead.lastName}
              {lead.age && <span className="text-muted-foreground font-normal ml-1 text-xs">{lead.age}</span>}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">{lead.primaryContact.name}</div>
          </div>
        </div>

        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", CARE_COLORS[lead.careInterest])}>
          {CARE_LABELS[lead.careInterest]}
        </span>

        <div className="mt-1.5">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", urgCfg.cls)}>
            {urgCfg.label}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/60">
          <span className="text-[10px] text-muted-foreground">{SOURCE_LABELS[lead.source]}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-mono" title="Days in pipeline">{days}d</span>
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
              {initials}
            </div>
          </div>
        </div>

        {lead.followUpDate && (
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
            <Calendar className="w-2.5 h-2.5" />
            Follow up: {fmtDate(lead.followUpDate!)}
          </div>
        )}
      </button>

      {/* Quick-log bar — stopPropagation on pointer so drag doesn't activate here */}
      <div
        className="border-t border-border/60 px-2 py-1.5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {!quickLogOpen ? (
          <button
            onClick={(e) => { e.stopPropagation(); setQuickLogOpen(true); }}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary transition-colors w-full cursor-pointer"
          >
            <PhoneCall size={11} />
            Quick log contact
          </button>
        ) : (
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1">
              {QUICK_LOG_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setLogType(t.value)}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer",
                    logType === t.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              value={logSubject}
              onChange={(e) => setLogSubject(e.target.value)}
              placeholder="Outcome / subject..."
              className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary cursor-text"
            />
            <input
              value={logBody}
              onChange={(e) => setLogBody(e.target.value)}
              placeholder="Notes (optional)..."
              className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary cursor-text"
            />
            <div className="flex gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); setQuickLogOpen(false); }}
                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] border border-border text-muted-foreground cursor-pointer"
              >
                <X size={10} /> Cancel
              </button>
              <button
                onClick={saveQuickLog}
                disabled={!logSubject.trim()}
                className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-primary text-primary-foreground font-medium disabled:opacity-40 cursor-pointer"
              >
                <Check size={10} /> Log
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LeadCardOverlay({ lead }: { lead: Lead }) {
  const urgCfg = URGENCY_CONFIG[lead.urgency];
  return (
    <div className="rounded-lg border p-3 shadow-2xl rotate-1 w-[240px] opacity-95 bg-card border-primary/40">
      <div className="font-semibold text-sm">{lead.firstName} {lead.lastName}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{lead.primaryContact.name}</div>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", CARE_COLORS[lead.careInterest])}>
          {CARE_LABELS[lead.careInterest]}
        </span>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", urgCfg.cls)}>
          {urgCfg.label}
        </span>
      </div>
    </div>
  );
}
