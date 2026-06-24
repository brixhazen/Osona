import { useState, useEffect } from "react";
import {
  LEADS,
  SCHEDULED_TOURS,
  PIPELINE_STAGES,
  RATE_ESTIMATES,
  SOURCE_LABELS,
  CARE_LABELS,
  type Lead,
  type Activity,
  type ScheduledTour,
  type CareInterest,
  type LeadSource,
  type BudgetType,
  type Urgency,
} from "@/lib/mock/crm";
import { PipelineBoard } from "./PipelineBoard";
import { LeadSheet } from "./LeadSheet";
import { LostLeadsSheet, MovedInSheet } from "./ClosedLeadsPanels";
import { cn } from "@/lib/utils";
import { Users, Calendar, TrendingUp, DollarSign, CheckCircle, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { NewResidentSetupModal } from "./NewResidentSetupModal";
import { addResidentToBilling, markRoomOccupied } from "@/lib/billingStore";
import { syncCrmData } from "@/lib/appStore";
import type { ResidentBilling } from "@/lib/mock/billing";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const MODULE_COLOR = "#F59E0B";
const TODAY = new Date().toISOString().slice(0, 10);

function quarterStart(): string {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3);
  return new Date(now.getFullYear(), q * 3, 1).toISOString().slice(0, 10);
}

const CARE_OPTIONS: { value: CareInterest; label: string }[] = [
  { value: "assisted", label: "Assisted Living" },
  { value: "memory_care", label: "Memory Care" },
  { value: "independent", label: "Independent Living" },
  { value: "respite", label: "Respite Care" },
  { value: "undecided", label: "Undecided" },
];

const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: "immediate", label: "Immediate (< 2 weeks)" },
  { value: "within_1mo", label: "Within 1 Month" },
  { value: "1_3mo", label: "1–3 Months" },
  { value: "3_6mo", label: "3–6 Months" },
  { value: "exploring", label: "Just Exploring" },
];

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "physician", label: "Physician Referral" },
  { value: "hospital", label: "Hospital" },
  { value: "family_referral", label: "Family Referral" },
  { value: "senior_advisor", label: "Senior Advisor" },
  { value: "event", label: "Event" },
  { value: "walk_in", label: "Walk-In" },
  { value: "returning", label: "Returning" },
];

const BUDGET_OPTIONS: { value: BudgetType; label: string }[] = [
  { value: "private_pay", label: "Private Pay" },
  { value: "ltci", label: "LTC Insurance" },
  { value: "medicaid", label: "Medicaid" },
  { value: "va", label: "VA Benefits" },
  { value: "unknown", label: "Unknown" },
];

const STAFF = ["Sarah Mitchell", "James Park", "Maria Santos", "David Chen", "Lisa Rodriguez"];

const RELATIONS = ["Daughter", "Son", "Spouse", "Parent", "Sibling", "Friend", "Self", "Other"];

export function CrmModule() {
  const [localLeads, setLocalLeads] = useState<Lead[]>([...LEADS]);
  const [localTours, setLocalTours] = useState<ScheduledTour[]>([...SCHEDULED_TOURS]);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterCare, setFilterCare] = useState("");
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [lostPanelOpen, setLostPanelOpen] = useState(false);
  const [movedInPanelOpen, setMovedInPanelOpen] = useState(false);
  const [moveInSetupLead, setMoveInSetupLead] = useState<Lead | null>(null);
  const [pendingMoveInId, setPendingMoveInId] = useState<string | null>(null);
  const [moveInBanner, setMoveInBanner] = useState<string | null>(null);

  const selectedLead = localLeads.find((l) => l.id === selectedLeadId) ?? null;

  function updateLead(id: string, updates: Partial<Lead>) {
    if (updates.stage === "moved_in") {
      const lead = localLeads.find((l) => l.id === id);
      if (lead) {
        setMoveInSetupLead(lead);
        setPendingMoveInId(id);
        return;
      }
    }
    setLocalLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }

  function handleMoveInConfirm(resident: ResidentBilling) {
    if (!pendingMoveInId) return;
    setLocalLeads((prev) =>
      prev.map((l) => (l.id === pendingMoveInId ? { ...l, stage: "moved_in" } : l)),
    );
    addActivity(pendingMoveInId, {
      id: `act-movein-${Date.now()}`,
      type: "note",
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      by: "Current User",
      subject: "Confirmed move-in — resident set up in billing",
      body: `Room ${resident.room} · ${resident.locTier} · $${resident.monthlyTotal.toLocaleString()}/mo`,
    });
    addResidentToBilling(resident);
    markRoomOccupied(resident.room, {
      residentName: resident.name,
      moveInDate: resident.moveInDate,
      wing: resident.wing,
    });
    setMoveInBanner(`${resident.name} added to billing · ${resident.room} · $${resident.monthlyTotal.toLocaleString()}/mo`);
    setTimeout(() => setMoveInBanner(null), 5000);
    setMoveInSetupLead(null);
    setPendingMoveInId(null);
  }

  function handleMoveInSkip() {
    if (pendingMoveInId) {
      setLocalLeads((prev) =>
        prev.map((l) => (l.id === pendingMoveInId ? { ...l, stage: "moved_in" } : l)),
      );
    }
    setMoveInSetupLead(null);
    setPendingMoveInId(null);
  }

  function addActivity(leadId: string, act: Activity) {
    setLocalLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, activities: [act, ...l.activities] } : l)),
    );
  }

  function addTour(tour: ScheduledTour) {
    setLocalTours((prev) => [...prev, tour]);
  }

  function updateTour(id: string, updates: Partial<ScheduledTour>) {
    setLocalTours((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }

  useEffect(() => {
    syncCrmData(localLeads, localTours);
  }, [localLeads, localTours]);

  function addLead(lead: Lead) {
    setLocalLeads((prev) => [...prev, lead]);
    setSelectedLeadId(lead.id);
    setNewLeadOpen(false);
  }

  function handleReactivate(leadId: string, reason: string) {
    updateLead(leadId, { stage: "inquiry" });
    addActivity(leadId, {
      id: `act-reactivate-${Date.now()}`,
      type: "note",
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      by: "Current User",
      subject: "Lead re-activated",
      body: reason.trim() || "Returned to Inquiry stage",
      outcome: "Follow up to reassess timeline",
    });
    setLostPanelOpen(false);
    setSelectedLeadId(leadId);
  }

  // Metrics
  const activeLeads = localLeads.filter((l) => !["moved_in", "lost"].includes(l.stage)).length;
  const toursThisWeek = localTours.filter((t) => t.status === "scheduled").length;
  const depositsThisMonth = localLeads.filter((l) => l.stage === "deposit").length;
  const projectedRevenue = localLeads
    .filter((l) => l.stage === "deposit")
    .reduce((sum, l) => sum + RATE_ESTIMATES[l.careInterest], 0);
  const touredCount = localLeads.filter((l) =>
    ["toured", "applied", "deposit", "moved_in"].includes(l.stage),
  ).length;
  const depositCount = localLeads.filter((l) => ["deposit", "moved_in"].includes(l.stage)).length;
  const conversionRate = touredCount > 0 ? Math.round((depositCount / touredCount) * 100) : 0;
  const pipelineLeads = localLeads.filter((l) =>
    PIPELINE_STAGES.includes(l.stage as typeof PIPELINE_STAGES[number]),
  );
  const overdueCount = pipelineLeads.filter((l) => {
    if (!l.followUpDate) return false;
    return new Date(l.followUpDate + "T00:00:00") < new Date(TODAY + "T00:00:00");
  }).length;

  // Quarter-accurate closed counts
  const qStart = quarterStart();
  const wonThisQuarter = localLeads.filter((l) => {
    if (l.stage !== "moved_in") return false;
    const act = l.activities.find((a) => a.subject.toLowerCase().includes("move") || a.type === "deposit");
    return act ? act.date >= qStart : l.createdAt >= qStart;
  }).length;
  const lostThisQuarter = localLeads.filter((l) => {
    if (l.stage !== "lost") return false;
    const act = l.activities.find((a) => a.type === "loss");
    return act ? act.date >= qStart : l.createdAt >= qStart;
  }).length;

  // Filter bar derived leads
  const filteredLeads = localLeads.filter((l) => {
    if (filterSearch && !`${l.firstName} ${l.lastName}`.toLowerCase().includes(filterSearch.toLowerCase())) return false;
    if (filterAssignee && l.assignedTo !== filterAssignee) return false;
    if (filterCare && l.careInterest !== filterCare) return false;
    if (filterOverdue) {
      if (!l.followUpDate) return false;
      if (!(new Date(l.followUpDate + "T00:00:00") < new Date(TODAY + "T00:00:00"))) return false;
    }
    return true;
  });
  const uniqueAssignees = [...new Set(localLeads.map((l) => l.assignedTo))].sort();
  const hasFilters = !!(filterSearch || filterAssignee || filterCare || filterOverdue);

  return (
    <div className="space-y-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      <div className="flex items-start justify-between gap-4">
        <ModuleHeader
          name="CRM & Sales"
          description="Lead pipeline, tour scheduling, and census growth."
          icon={Users}
          color={MODULE_COLOR}
        />
        <button
          onClick={() => setNewLeadOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium shrink-0 mt-1"
          style={{ backgroundColor: MODULE_COLOR, color: "#000" }}
        >
          <Plus size={14} />
          New Lead
        </button>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          {overdueCount} follow-up{overdueCount > 1 ? "s" : ""} overdue
        </div>
      )}

      {/* KPI bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard icon={Users} label="Active Leads" value={String(activeLeads)} sub="in pipeline" />
        <KpiCard icon={Calendar} label="Tours This Week" value={String(toursThisWeek)} sub="scheduled" accent />
        <KpiCard icon={CheckCircle} label="Deposits" value={String(depositsThisMonth)} sub="pending move-in" positive />
        <KpiCard
          icon={DollarSign}
          label="Projected Revenue"
          value={`$${(projectedRevenue / 1000).toFixed(1)}k`}
          sub="from deposit stage"
          positive
        />
        <KpiCard icon={TrendingUp} label="Tour → Deposit" value={`${conversionRate}%`} sub="conversion rate" />
      </div>

      {/* Today's tours strip */}
      <TodaysTours tours={localTours} onSelectLead={setSelectedLeadId} />

      {/* Filter bar */}
      <FilterBar
        search={filterSearch}
        assignee={filterAssignee}
        care={filterCare}
        overdue={filterOverdue}
        assignees={uniqueAssignees}
        careOptions={CARE_OPTIONS}
        hasFilters={hasFilters}
        onSearch={setFilterSearch}
        onAssignee={setFilterAssignee}
        onCare={setFilterCare}
        onOverdue={setFilterOverdue}
        onClear={() => { setFilterSearch(""); setFilterAssignee(""); setFilterCare(""); setFilterOverdue(false); }}
      />

      {/* Kanban pipeline */}
      <PipelineBoard
        leads={filteredLeads}
        wonThisQuarter={wonThisQuarter}
        lostThisQuarter={lostThisQuarter}
        selectedLeadId={selectedLeadId}
        onSelectLead={setSelectedLeadId}
        onAddActivity={addActivity}
        onUpdateLead={updateLead}
        onOpenLost={() => setLostPanelOpen(true)}
        onOpenMovedIn={() => setMovedInPanelOpen(true)}
      />

      {/* Lead detail sheet */}
      <LeadSheet
        lead={selectedLead}
        onClose={() => setSelectedLeadId(null)}
        tours={localTours}
        staff={STAFF}
        onUpdateLead={updateLead}
        onAddActivity={addActivity}
        onAddTour={addTour}
        onUpdateTour={updateTour}
      />

      {/* New Lead sheet */}
      <NewLeadSheet
        open={newLeadOpen}
        onClose={() => setNewLeadOpen(false)}
        onAdd={addLead}
      />

      {/* Lost leads panel */}
      <LostLeadsSheet
        open={lostPanelOpen}
        onClose={() => setLostPanelOpen(false)}
        leads={localLeads.filter((l) => l.stage === "lost")}
        onReactivate={handleReactivate}
        onViewLead={(id) => setSelectedLeadId(id)}
      />

      {/* Moved-in panel */}
      <MovedInSheet
        open={movedInPanelOpen}
        onClose={() => setMovedInPanelOpen(false)}
        leads={localLeads.filter((l) => l.stage === "moved_in")}
        onViewLead={(id) => setSelectedLeadId(id)}
      />

      {/* New resident setup modal — appears when a lead is moved to Moved In */}
      {moveInSetupLead && (
        <NewResidentSetupModal
          lead={moveInSetupLead}
          onConfirm={handleMoveInConfirm}
          onSkip={handleMoveInSkip}
        />
      )}

      {/* Success banner */}
      {moveInBanner && (
        <div className="fixed bottom-5 right-5 z-[70] flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-sm font-medium text-white animate-in slide-in-from-bottom-2"
          style={{ backgroundColor: "#16a34a" }}>
          <CheckCircle size={16} />
          {moveInBanner}
        </div>
      )}
    </div>
  );
}

function NewLeadSheet({
  open, onClose, onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (lead: Lead) => void;
}) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", age: "",
    phone: "", email: "",
    careInterest: "assisted" as CareInterest,
    urgency: "1_3mo" as Urgency,
    source: "website" as LeadSource,
    budget: "private_pay" as BudgetType,
    assignedTo: STAFF[0],
    contactName: "", contactRelation: "Daughter", contactPhone: "", contactEmail: "",
    notes: "",
  });

  const isValid = form.firstName.trim() && form.lastName.trim() && form.contactName.trim() && form.contactPhone.trim();

  function field(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!isValid) return;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const followUp = new Date(now);
    followUp.setDate(followUp.getDate() + 7);

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      age: form.age ? Number(form.age) : undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      stage: "inquiry",
      careInterest: form.careInterest,
      primaryContact: {
        name: form.contactName.trim(),
        relation: form.contactRelation,
        phone: form.contactPhone.trim(),
        email: form.contactEmail || undefined,
      },
      budget: form.budget,
      source: form.source,
      assignedTo: form.assignedTo,
      createdAt: today,
      followUpDate: followUp.toISOString().slice(0, 10),
      urgency: form.urgency,
      notes: form.notes.trim(),
      activities: [
        {
          id: `act-new-${Date.now()}`,
          type: "note",
          date: today,
          time: now.toTimeString().slice(0, 5),
          by: "Current User",
          subject: "New inquiry created",
          body: `Interest: ${CARE_LABELS[form.careInterest]} · Source: ${SOURCE_LABELS[form.source]}`,
        },
      ],
    };
    onAdd(newLead);
    setForm({
      firstName: "", lastName: "", age: "",
      phone: "", email: "",
      careInterest: "assisted", urgency: "1_3mo", source: "website", budget: "private_pay",
      assignedTo: STAFF[0],
      contactName: "", contactRelation: "Daughter", contactPhone: "", contactEmail: "",
      notes: "",
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-[480px] bg-card border-l border-border overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Plus size={16} className="text-primary" />
            New Lead
          </SheetTitle>
          <SheetDescription>Add a new prospect to the Inquiry stage.</SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Prospect info */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Prospect</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">First Name <span className="text-destructive">*</span></label>
                <input value={form.firstName} onChange={(e) => field("firstName", e.target.value)} placeholder="Margaret"
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Last Name <span className="text-destructive">*</span></label>
                <input value={form.lastName} onChange={(e) => field("lastName", e.target.value)} placeholder="Olson"
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Age</label>
                <input value={form.age} onChange={(e) => field("age", e.target.value)} placeholder="82" type="number"
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Direct Phone</label>
                <input value={form.phone} onChange={(e) => field("phone", e.target.value)} placeholder="(555) 000-0000"
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-muted-foreground block mb-1">Direct Email</label>
                <input value={form.email} onChange={(e) => field("email", e.target.value)} placeholder="prospect@email.com" type="email"
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
          </section>

          {/* Care interest */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Care Interest</p>
            <div className="flex flex-wrap gap-1.5">
              {CARE_OPTIONS.map((o) => (
                <button key={o.value} onClick={() => field("careInterest", o.value)}
                  className={cn("px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                    form.careInterest === o.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          {/* Urgency */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Urgency</p>
            <div className="flex flex-wrap gap-1.5">
              {URGENCY_OPTIONS.map((o) => (
                <button key={o.value} onClick={() => field("urgency", o.value)}
                  className={cn("px-2.5 py-1 rounded text-xs font-medium border transition-colors",
                    form.urgency === o.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          {/* Primary contact */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Primary Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Name <span className="text-destructive">*</span></label>
                <input value={form.contactName} onChange={(e) => field("contactName", e.target.value)} placeholder="Jane Smith"
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Relation</label>
                <select value={form.contactRelation} onChange={(e) => field("contactRelation", e.target.value)}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {RELATIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Phone <span className="text-destructive">*</span></label>
                <input value={form.contactPhone} onChange={(e) => field("contactPhone", e.target.value)} placeholder="(555) 000-0000"
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Email</label>
                <input value={form.contactEmail} onChange={(e) => field("contactEmail", e.target.value)} placeholder="contact@email.com"
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
          </section>

          {/* Source + Budget + Assigned */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Source</label>
                <select value={form.source} onChange={(e) => field("source", e.target.value as LeadSource)}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Budget</label>
                <select value={form.budget} onChange={(e) => field("budget", e.target.value as BudgetType)}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {BUDGET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-muted-foreground block mb-1">Assigned To</label>
                <select value={form.assignedTo} onChange={(e) => field("assignedTo", e.target.value)}
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  {STAFF.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</p>
            <textarea value={form.notes} onChange={(e) => field("notes", e.target.value)}
              placeholder="Initial context, special considerations..."
              rows={3}
              className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary" />
          </section>

          <div className="flex gap-2 pt-2 border-t border-border">
            <button onClick={onClose} className="flex-1 px-3 py-2 rounded text-sm border border-border text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!isValid}
              className="flex-1 px-3 py-2 rounded text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: MODULE_COLOR, color: "#000" }}>
              Add Lead
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FilterBar({
  search, assignee, care, overdue, assignees, careOptions, hasFilters,
  onSearch, onAssignee, onCare, onOverdue, onClear,
}: {
  search: string; assignee: string; care: string; overdue: boolean;
  assignees: string[]; careOptions: { value: string; label: string }[];
  hasFilters: boolean;
  onSearch: (v: string) => void; onAssignee: (v: string) => void;
  onCare: (v: string) => void; onOverdue: (v: boolean) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />
      <div className="relative flex-1 min-w-[160px] max-w-[240px]">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search leads..."
          className="w-full rounded border border-border bg-card pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <select
        value={assignee}
        onChange={(e) => onAssignee(e.target.value)}
        className="rounded border border-border bg-card px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">All staff</option>
        {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <select
        value={care}
        onChange={(e) => onCare(e.target.value)}
        className="rounded border border-border bg-card px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
      >
        <option value="">All care types</option>
        {careOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <button
        onClick={() => onOverdue(!overdue)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-medium transition-colors",
          overdue
            ? "bg-destructive/10 text-destructive border-destructive/30"
            : "bg-card border-border text-muted-foreground hover:text-foreground",
        )}
      >
        Overdue only
      </button>
      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, sub, accent, positive,
}: {
  icon: typeof Users; label: string; value: string; sub: string; accent?: boolean; positive?: boolean;
}) {
  return (
    <div className="rounded-lg bg-card border border-border p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        <Icon className={cn("w-3.5 h-3.5", accent ? "text-accent" : positive ? "text-success" : "text-muted-foreground")} />
      </div>
      <div className={cn("font-mono text-2xl font-bold leading-none", accent ? "text-accent" : positive ? "text-success" : "")}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function TodaysTours({ tours, onSelectLead }: { tours: ScheduledTour[]; onSelectLead: (id: string) => void }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLabel = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const today = tours.filter((t) => t.date === todayStr && t.status === "scheduled");
  if (today.length === 0) return null;
  return (
    <div className="rounded-lg bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Today's Tours</h3>
        <span className="text-[11px] text-muted-foreground">{todayLabel}</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {today.map((t) => (
          <button key={t.id} onClick={() => onSelectLead(t.leadId)}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 hover:border-primary/40 transition-colors text-left">
            <div className={cn("w-2 h-2 rounded-full shrink-0",
              t.careInterest === "memory_care" ? "bg-destructive" : t.careInterest === "assisted" ? "bg-primary" : "bg-success")} />
            <div>
              <div className="font-medium text-sm">{t.leadName}</div>
              <div className="text-[11px] text-muted-foreground">{t.time} · {t.duration} · {t.conductedBy}</div>
              <div className="text-[11px] text-muted-foreground">{t.contactName}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
