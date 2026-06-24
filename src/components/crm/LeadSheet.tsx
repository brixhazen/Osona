import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  STAGE_CONFIG,
  URGENCY_CONFIG,
  CARE_LABELS,
  CARE_COLORS,
  SOURCE_LABELS,
  RATE_ESTIMATES,
  PIPELINE_STAGES,
  type Lead,
  type LeadStage,
  type ActivityType,
  type Activity,
  type ScheduledTour,
} from "@/lib/mock/crm";
import { cn } from "@/lib/utils";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  PhoneCall,
  Home,
  ArrowRight,
  DollarSign,
  Clock,
  Plus,
  Pencil,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";

interface Props {
  lead: Lead | null;
  onClose: () => void;
  tours: ScheduledTour[];
  staff: string[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  onAddActivity: (leadId: string, act: Activity) => void;
  onAddTour: (tour: ScheduledTour) => void;
  onUpdateTour: (id: string, updates: Partial<ScheduledTour>) => void;
}

const ACTIVITY_ICONS: Record<ActivityType, typeof Phone> = {
  call: PhoneCall,
  email: Mail,
  tour: Home,
  visit: Home,
  note: FileText,
  application: FileText,
  deposit: DollarSign,
  loss: ArrowRight,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  call: "bg-primary/15 text-primary border-primary/25",
  email: "bg-muted/40 text-muted-foreground border-border",
  tour: "bg-accent/15 text-accent border-accent/25",
  visit: "bg-accent/15 text-accent border-accent/25",
  note: "bg-muted/40 text-muted-foreground border-border",
  application: "bg-warning/15 text-warning border-warning/25",
  deposit: "bg-success/15 text-success border-success/25",
  loss: "bg-destructive/15 text-destructive border-destructive/25",
};

const TODAY = new Date().toISOString().slice(0, 10);

export function LeadSheet({ lead, onClose, tours, staff, onUpdateLead, onAddActivity, onAddTour, onUpdateTour }: Props) {
  if (!lead) return null;
  return (
    <Sheet open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[440px] sm:w-[500px] overflow-y-auto bg-card border-l border-border p-0">
        <LeadSheetInner
          key={lead.id}
          lead={lead}
          tours={tours}
          staff={staff}
          onUpdateLead={onUpdateLead}
          onAddActivity={onAddActivity}
          onAddTour={onAddTour}
          onUpdateTour={onUpdateTour}
          onClose={onClose}
        />
      </SheetContent>
    </Sheet>
  );
}

function LeadSheetInner({
  lead, tours, staff, onUpdateLead, onAddActivity, onAddTour, onUpdateTour, onClose,
}: {
  lead: Lead;
  tours: ScheduledTour[];
  staff: string[];
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  onAddActivity: (leadId: string, act: Activity) => void;
  onAddTour: (tour: ScheduledTour) => void;
  onUpdateTour: (id: string, updates: Partial<ScheduledTour>) => void;
  onClose: () => void;
}) {
  const urgCfg = URGENCY_CONFIG[lead.urgency];
  const stageCfg = STAGE_CONFIG[lead.stage];
  const estimatedRate = RATE_ESTIMATES[lead.careInterest];
  const leadTours = tours.filter((t) => t.leadId === lead.id);

  const daysInPipeline = Math.floor(
    (new Date(TODAY + "T00:00:00").getTime() - new Date(lead.createdAt + "T00:00:00").getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const sorted = [...lead.activities].sort((a, b) =>
    `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
  );

  const isLostOrMoved = lead.stage === "lost" || lead.stage === "moved_in";
  const followUpOverdue = lead.followUpDate
    ? new Date(lead.followUpDate + "T00:00:00") < new Date(TODAY + "T00:00:00")
    : false;

  // Activity form
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [actType, setActType] = useState<ActivityType>("call");
  const [actSubject, setActSubject] = useState("");
  const [actBody, setActBody] = useState("");
  const [actOutcome, setActOutcome] = useState("");

  // Tour form
  const [showTourForm, setShowTourForm] = useState(false);
  const [tourDate, setTourDate] = useState("");
  const [tourTime, setTourTime] = useState("10:00");
  const [tourDuration, setTourDuration] = useState("45 min");
  const [tourBy, setTourBy] = useState("");
  const [tourParty, setTourParty] = useState("2");
  const [tourNotes, setTourNotes] = useState("");

  // Loss confirm
  const [showLostConfirm, setShowLostConfirm] = useState(false);
  const [lostReason, setLostReason] = useState("");

  // Notes edit
  const [editingNotes, setEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState(lead.notes);

  // Follow-up edit
  const [editingFollowUp, setEditingFollowUp] = useState(false);
  const [draftFollowUp, setDraftFollowUp] = useState(lead.followUpDate ?? "");

  function saveActivity() {
    if (!actSubject.trim()) return;
    const now = new Date();
    onAddActivity(lead.id, {
      id: `act-${Date.now()}`,
      type: actType,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      by: "Current User",
      subject: actSubject.trim(),
      body: actBody.trim(),
      outcome: actOutcome.trim() || undefined,
    });
    setActSubject(""); setActBody(""); setActOutcome(""); setActType("call");
    setShowActivityForm(false);
  }

  function saveTour() {
    if (!tourDate || !tourBy.trim()) return;
    onAddTour({
      id: `tour-${Date.now()}`,
      leadId: lead.id,
      leadName: `${lead.firstName} ${lead.lastName}`,
      contactName: lead.primaryContact.name,
      date: tourDate,
      time: tourTime,
      duration: tourDuration,
      conductedBy: tourBy.trim(),
      careInterest: lead.careInterest,
      partySize: Number(tourParty),
      notes: tourNotes.trim() || undefined,
      status: "scheduled",
    });
    onAddActivity(lead.id, {
      id: `act-tour-${Date.now()}`,
      type: "tour",
      date: tourDate,
      time: tourTime,
      by: tourBy.trim(),
      subject: `Tour scheduled — ${tourDate} at ${tourTime}`,
      body: `Party of ${tourParty} · ${tourDuration} · Conducted by ${tourBy}`,
    });
    onUpdateLead(lead.id, { stage: lead.stage === "inquiry" || lead.stage === "nurturing" ? "toured" : lead.stage });
    setTourDate(""); setTourTime("10:00"); setTourBy(""); setTourParty("2"); setTourNotes("");
    setShowTourForm(false);
  }

  function advanceStage(stage: LeadStage) {
    onUpdateLead(lead.id, { stage });
    onAddActivity(lead.id, {
      id: `act-stage-${Date.now()}`,
      type: stage === "deposit" ? "deposit" : stage === "applied" ? "application" : "note",
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      by: "Current User",
      subject: `Stage advanced to ${STAGE_CONFIG[stage].label}`,
      body: "",
    });
  }

  function fmtDate(iso: string) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function markLost() {
    onUpdateLead(lead.id, { stage: "lost" });
    onAddActivity(lead.id, {
      id: `act-lost-${Date.now()}`,
      type: "loss",
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      by: "Current User",
      subject: "Lead marked lost",
      body: lostReason.trim(),
    });
    setShowLostConfirm(false);
    setLostReason("");
  }

  function saveNotes() {
    onUpdateLead(lead.id, { notes: draftNotes });
    setEditingNotes(false);
  }

  function saveFollowUp() {
    onUpdateLead(lead.id, { followUpDate: draftFollowUp || undefined });
    setEditingFollowUp(false);
  }

  const LOG_TYPES: ActivityType[] = ["call", "email", "note", "visit"];

  return (
    <>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-5 py-4">
        <SheetHeader>
          <SheetTitle className="font-display text-lg font-bold tracking-tight text-left">
            {lead.firstName} {lead.lastName}
            {lead.age && <span className="text-muted-foreground font-normal text-sm ml-2">{lead.age} yo</span>}
          </SheetTitle>
        </SheetHeader>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={cn("text-[11px] px-2 py-0.5 rounded border font-medium", CARE_COLORS[lead.careInterest])}>
            {CARE_LABELS[lead.careInterest]}
          </span>
          <span className={cn("text-[11px] px-2 py-0.5 rounded border font-medium", urgCfg.cls)}>
            {urgCfg.label}
          </span>
          <span className={cn("text-[11px] px-2 py-0.5 rounded border font-medium", stageCfg.headerCls)}>
            {stageCfg.label}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* Stage progression */}
        {!isLostOrMoved && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pipeline Stage — click any stage to move</p>
            <div className="flex items-center gap-1 flex-wrap">
              {PIPELINE_STAGES.map((s, i) => {
                const cfg = STAGE_CONFIG[s];
                const currentIdx = PIPELINE_STAGES.indexOf(lead.stage as typeof PIPELINE_STAGES[number]);
                const isCurrent = s === lead.stage;
                const isPast = currentIdx > i;
                const isFuture = currentIdx < i;
                return (
                  <div key={s} className="flex items-center gap-1">
                    <button
                      disabled={isCurrent}
                      onClick={() => advanceStage(s)}
                      title={isPast ? `← Move back to ${cfg.label}` : `Advance to ${cfg.label}`}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap transition-all duration-150",
                        isCurrent
                          ? cn(cfg.headerCls, "font-bold ring-1 ring-current cursor-default")
                          : isPast
                          ? "bg-success/10 text-success border-success/20 hover:bg-warning/10 hover:text-warning hover:border-warning/30 hover:scale-105 cursor-pointer"
                          : "bg-muted/20 text-muted-foreground/60 border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 hover:scale-105 cursor-pointer",
                      )}
                    >
                      {cfg.label}
                    </button>
                    {i < PIPELINE_STAGES.length - 1 && (
                      <ArrowRight className="w-2.5 h-2.5 text-border shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-2">
              {lead.stage === "deposit" && (
                <button
                  onClick={() => onUpdateLead(lead.id, { stage: "moved_in" })}
                  className="px-2.5 py-1 rounded text-xs font-medium bg-success/15 text-success border border-success/30 hover:bg-success/25 transition-colors"
                >
                  ✓ Confirm Move-In
                </button>
              )}
              {!showLostConfirm && (
                <button
                  onClick={() => setShowLostConfirm(true)}
                  className="px-2.5 py-1 rounded text-xs font-medium bg-destructive/10 text-destructive border border-destructive/25 hover:bg-destructive/20 transition-colors"
                >
                  Mark Lost
                </button>
              )}
            </div>
            {showLostConfirm && (
              <div className="mt-2 space-y-2 p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                <p className="text-xs font-semibold text-destructive">Confirm — mark as lost?</p>
                <textarea
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  placeholder="Reason (e.g. chose competitor, not ready, out of budget)..."
                  rows={2}
                  autoFocus
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-destructive"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowLostConfirm(false)} className="px-2.5 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground">Cancel</button>
                  <button onClick={markLost} className="px-2.5 py-1 rounded text-xs bg-destructive text-white font-medium hover:opacity-90 transition-opacity">Confirm Lost</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key info grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoCard label="Assigned To" value={lead.assignedTo} />
          <InfoCard label="Source" value={SOURCE_LABELS[lead.source]} />
          <InfoCard label="Budget" value={<span className="capitalize">{lead.budget.replace("_", " ").replace("ltci", "LTC Insurance")}</span>} />
          <InfoCard label="Est. Rate" value={`$${estimatedRate.toLocaleString()}/mo`} positive />
          <InfoCard label="Days in Pipeline" value={`${daysInPipeline} days`} />
          {/* Follow-up date with inline edit */}
          <div className="rounded-md bg-surface border border-border p-3">
            <div className="flex items-center justify-between mb-0.5">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Follow-Up Due</div>
              {!editingFollowUp && (
                <button onClick={() => { setDraftFollowUp(lead.followUpDate ?? ""); setEditingFollowUp(true); }} className="text-muted-foreground hover:text-primary">
                  <Pencil size={10} />
                </button>
              )}
            </div>
            {editingFollowUp ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="date"
                  value={draftFollowUp}
                  onChange={(e) => setDraftFollowUp(e.target.value)}
                  className="flex-1 rounded border border-border bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={saveFollowUp} className="text-success hover:text-success/80"><Check size={12} /></button>
                <button onClick={() => setEditingFollowUp(false)} className="text-muted-foreground hover:text-foreground"><X size={12} /></button>
              </div>
            ) : (
              <div className={cn("text-xs font-medium", lead.followUpDate ? "" : "text-muted-foreground")}>
                {lead.followUpDate ? fmtDate(lead.followUpDate) : "Not set"}
              </div>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Primary Contact</p>
          <div className="font-semibold text-sm mb-0.5">{lead.primaryContact.name}</div>
          <div className="text-xs text-muted-foreground mb-2">{lead.primaryContact.relation}</div>
          <div className="space-y-1.5">
            <a href={`tel:${lead.primaryContact.phone}`} className="flex items-center gap-2 text-xs hover:text-primary transition-colors">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              {lead.primaryContact.phone}
            </a>
            {lead.primaryContact.email && (
              <a href={`mailto:${lead.primaryContact.email}`} className="flex items-center gap-2 text-xs hover:text-primary transition-colors">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {lead.primaryContact.email}
              </a>
            )}
          </div>
          {(lead.phone || lead.email) && lead.primaryContact.relation !== "Self" && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-[11px] text-muted-foreground mb-1.5">Prospect direct</div>
              {lead.phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" /> {lead.phone}
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Mail className="w-3.5 h-3.5" /> {lead.email}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes — editable */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
            {!editingNotes && (
              <button
                onClick={() => { setDraftNotes(lead.notes); setEditingNotes(true); }}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                <Pencil size={11} />
                {lead.notes ? "Edit" : "Add Note"}
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={4}
                placeholder="Add notes about this prospect..."
                className="w-full rounded border border-border bg-background px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditingNotes(false)} className="px-2.5 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={saveNotes} className="px-2.5 py-1 rounded text-xs bg-primary text-primary-foreground font-medium">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lead.notes || <span className="italic">No notes yet.</span>}
            </p>
          )}
        </div>

        {/* Scheduled tours */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
              Tours ({leadTours.length})
            </p>
            {!showTourForm && (
              <button
                onClick={() => setShowTourForm(true)}
                className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium"
              >
                <Plus size={12} /> Schedule Tour
              </button>
            )}
          </div>

          {showTourForm && (
            <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
              <p className="text-[11px] font-semibold text-primary">New Tour</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Date <span className="text-destructive">*</span></label>
                  <input type="date" value={tourDate} onChange={(e) => setTourDate(e.target.value)}
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Time</label>
                  <input type="time" value={tourTime} onChange={(e) => setTourTime(e.target.value)}
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Duration</label>
                  <select value={tourDuration} onChange={(e) => setTourDuration(e.target.value)}
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                    {["30 min", "45 min", "1 hour", "1.5 hours"].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Party Size</label>
                  <input type="number" min="1" max="10" value={tourParty} onChange={(e) => setTourParty(e.target.value)}
                    className="w-full rounded border border-border bg-card px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">Conducted By <span className="text-destructive">*</span></label>
                <select value={tourBy} onChange={(e) => setTourBy(e.target.value)}
                  className="w-full rounded border border-border bg-card px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Select staff...</option>
                  {staff.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-0.5">Notes</label>
                <input value={tourNotes} onChange={(e) => setTourNotes(e.target.value)} placeholder="Special requests, mobility needs..."
                  className="w-full rounded border border-border bg-card px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowTourForm(false)} className="px-2.5 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={saveTour} disabled={!tourDate || !tourBy.trim()}
                  className="px-2.5 py-1 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40">
                  Schedule
                </button>
              </div>
            </div>
          )}

          {leadTours.length > 0 ? (
            <div className="space-y-2">
              {leadTours.map((t) => (
                <div key={t.id} className="text-xs border-l-2 border-accent/40 pl-3">
                  <div className="font-medium">{t.date} at {t.time}</div>
                  <div className="text-muted-foreground">{t.duration} · {t.conductedBy} · Party of {t.partySize}</div>
                  {t.notes && <div className="text-muted-foreground mt-0.5 italic">{t.notes}</div>}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize",
                      t.status === "scheduled" ? "bg-primary/10 text-primary border-primary/20" :
                      t.status === "completed" ? "bg-success/10 text-success border-success/20" :
                      t.status === "no_show" ? "bg-warning/10 text-warning border-warning/20" :
                      "bg-muted/30 text-muted-foreground border-border"
                    )}>
                      {t.status.replace("_", " ")}
                    </span>
                    {t.status === "scheduled" && (
                      <>
                        <button
                          onClick={() => onUpdateTour(t.id, { status: "completed" })}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-success/25 bg-success/10 text-success hover:bg-success/20 transition-colors font-medium"
                        >
                          ✓ Completed
                        </button>
                        <button
                          onClick={() => onUpdateTour(t.id, { status: "no_show" })}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/20 text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                          No Show
                        </button>
                        <button
                          onClick={() => {
                            onUpdateTour(t.id, { status: "cancelled" });
                            onAddActivity(lead.id, {
                              id: `act-cancel-${Date.now()}`,
                              type: "note",
                              date: new Date().toISOString().slice(0, 10),
                              time: new Date().toTimeString().slice(0, 5),
                              by: "Current User",
                              subject: `Tour cancelled — was ${t.date} at ${t.time}`,
                              body: "",
                            });
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/15 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onUpdateTour(t.id, { status: "cancelled" });
                            setShowTourForm(true);
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-accent/25 bg-accent/5 text-accent hover:bg-accent/15 transition-colors font-medium"
                        >
                          Reschedule
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No tours scheduled.</p>
          )}
        </div>

        {/* Activity log */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Activity Log</p>
            {!showActivityForm && (
              <button
                onClick={() => setShowActivityForm(true)}
                className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium"
              >
                <Plus size={12} /> Log Activity
              </button>
            )}
          </div>

          {showActivityForm && (
            <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
              <div className="flex gap-1.5 flex-wrap">
                {LOG_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActType(t)}
                    className={cn(
                      "px-2.5 py-1 rounded text-xs font-medium border capitalize transition-colors",
                      actType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                value={actSubject}
                onChange={(e) => setActSubject(e.target.value)}
                placeholder="Subject / outcome... *"
                className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <textarea
                value={actBody}
                onChange={(e) => setActBody(e.target.value)}
                placeholder="Details (optional)..."
                rows={2}
                className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                value={actOutcome}
                onChange={(e) => setActOutcome(e.target.value)}
                placeholder="Next step / outcome..."
                className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowActivityForm(false)} className="px-2.5 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground">Cancel</button>
                <button onClick={saveActivity} disabled={!actSubject.trim()}
                  className="px-2.5 py-1 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40">
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="relative pl-4">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
            <div className="space-y-4">
              {sorted.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] ?? FileText;
                return (
                  <div key={activity.id} className="relative">
                    <div className={cn(
                      "absolute -left-4 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center top-0.5",
                      activity.type === "deposit" ? "border-success bg-success/20" :
                      activity.type === "tour" || activity.type === "visit" ? "border-accent bg-accent/20" :
                      activity.type === "application" ? "border-warning bg-warning/20" :
                      activity.type === "loss" ? "border-destructive bg-destructive/20" :
                      activity.type === "call" ? "border-primary bg-primary/20" :
                      "border-border bg-surface",
                    )} />
                    <div className="pl-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", ACTIVITY_COLORS[activity.type])}>
                          {activity.type}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {activity.date} · {activity.time}
                        </span>
                      </div>
                      <p className="font-medium text-xs mt-1">{activity.subject}</p>
                      {activity.body && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{activity.body}</p>}
                      {activity.outcome && (
                        <p className="text-xs text-primary mt-1 font-medium">→ {activity.outcome}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">— {activity.by}</p>
                    </div>
                  </div>
                );
              })}
              {sorted.length === 0 && (
                <p className="text-xs text-muted-foreground pl-2 italic">No activity logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCard({
  label, value, positive, alert,
}: {
  label: string; value: React.ReactNode; positive?: boolean; alert?: boolean;
}) {
  return (
    <div className="rounded-md bg-surface border border-border p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</div>
      <div className={cn("text-xs font-medium", positive ? "text-success" : alert ? "text-destructive font-semibold" : "")}>
        {value}
      </div>
    </div>
  );
}
