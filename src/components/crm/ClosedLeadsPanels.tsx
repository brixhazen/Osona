import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  CARE_LABELS,
  CARE_COLORS,
  URGENCY_CONFIG,
  SOURCE_LABELS,
  type Lead,
} from "@/lib/mock/crm";
import { cn } from "@/lib/utils";
import { Search, RotateCcw, ExternalLink, UserX, UserCheck } from "lucide-react";

// ── Lost Leads Sheet ──────────────────────────────────────────────────────────

export function LostLeadsSheet({
  open,
  onClose,
  leads,
  onReactivate,
  onViewLead,
}: {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
  onReactivate: (leadId: string, reason: string) => void;
  onViewLead: (leadId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const filtered = leads.filter((l) =>
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  function confirmReactivate(leadId: string) {
    onReactivate(leadId, reason);
    setReactivatingId(null);
    setReason("");
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-[480px] bg-card border-l border-border flex flex-col p-0">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <SheetHeader className="mb-3">
            <SheetTitle className="flex items-center gap-2 text-left">
              <UserX size={16} className="text-destructive" />
              Lost Leads
              <span className="text-muted-foreground font-normal text-sm ml-1">({leads.length})</span>
            </SheetTitle>
            <SheetDescription>
              Re-activate a lead to return them to the Inquiry stage and reopen their file.
            </SheetDescription>
          </SheetHeader>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <UserX size={28} className="text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? "No leads match your search." : "No lost leads on record."}
              </p>
            </div>
          )}

          {filtered.map((lead) => {
            const sortedActs = [...lead.activities].sort((a, b) =>
              `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
            );
            const lastActivity = sortedActs[0];
            const urgCfg = URGENCY_CONFIG[lead.urgency];
            const isReactivating = reactivatingId === lead.id;

            return (
              <div
                key={lead.id}
                className={cn(
                  "rounded-lg border p-4 transition-all duration-150",
                  isReactivating
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-surface",
                )}
              >
                {/* Lead info */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">
                      {lead.firstName} {lead.lastName}
                      {lead.age && (
                        <span className="text-muted-foreground font-normal text-xs ml-1.5">{lead.age} yo</span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {lead.assignedTo} · {SOURCE_LABELS[lead.source]}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", CARE_COLORS[lead.careInterest])}>
                      {CARE_LABELS[lead.careInterest]}
                    </span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", urgCfg.cls)}>
                      {urgCfg.label}
                    </span>
                  </div>
                </div>

                {/* Last activity */}
                {lastActivity && (
                  <div className="text-[11px] text-muted-foreground mb-3 pl-2.5 border-l-2 border-destructive/30">
                    <span className="font-mono">{lastActivity.date}</span>
                    <span className="mx-1">—</span>
                    {lastActivity.subject}
                  </div>
                )}

                {/* Actions */}
                {!isReactivating ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setReactivatingId(lead.id); setReason(""); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-colors"
                    >
                      <RotateCcw size={11} />
                      Re-activate
                    </button>
                    <button
                      onClick={() => { onViewLead(lead.id); onClose(); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground border border-border hover:text-foreground hover:border-primary/30 transition-colors"
                    >
                      <ExternalLink size={11} />
                      View Details
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-primary">Why are they being re-opened?</p>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Family called back, situation changed, ready to move forward..."
                      rows={2}
                      autoFocus
                      className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReactivatingId(null)}
                        className="px-2.5 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => confirmReactivate(lead.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        <RotateCcw size={11} />
                        Confirm — Return to Inquiry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Moved In Sheet ────────────────────────────────────────────────────────────

export function MovedInSheet({
  open,
  onClose,
  leads,
  onViewLead,
}: {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
  onViewLead: (leadId: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = leads.filter((l) =>
    `${l.firstName} ${l.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-[480px] bg-card border-l border-border flex flex-col p-0">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          <SheetHeader className="mb-3">
            <SheetTitle className="flex items-center gap-2 text-left">
              <UserCheck size={16} className="text-success" />
              Moved In
              <span className="text-muted-foreground font-normal text-sm ml-1">({leads.length})</span>
            </SheetTitle>
            <SheetDescription>
              Residents who have completed the move-in process this quarter.
            </SheetDescription>
          </SheetHeader>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <UserCheck size={28} className="text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? "No residents match your search." : "No move-ins recorded yet."}
              </p>
            </div>
          )}

          {filtered.map((lead) => {
            const sortedActs = [...lead.activities].sort((a, b) =>
              `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
            );
            // Find a move-in or deposit activity for the date, fall back to most recent
            const moveInAct = sortedActs.find(
              (a) =>
                a.type === "deposit" ||
                a.subject.toLowerCase().includes("move") ||
                a.subject.toLowerCase().includes("moved"),
            ) ?? sortedActs[0];

            return (
              <div
                key={lead.id}
                className="rounded-lg border border-success/20 bg-success/5 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">
                      {lead.firstName} {lead.lastName}
                      {lead.age && (
                        <span className="text-muted-foreground font-normal text-xs ml-1.5">{lead.age} yo</span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {lead.assignedTo}
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0",
                    CARE_COLORS[lead.careInterest],
                  )}>
                    {CARE_LABELS[lead.careInterest]}
                  </span>
                </div>

                <div className="text-[11px] text-muted-foreground mb-3 pl-2.5 border-l-2 border-success/40">
                  Moved in:{" "}
                  <span className="font-mono font-medium text-foreground">
                    {moveInAct?.date ?? "—"}
                  </span>
                  {moveInAct?.subject && moveInAct.subject !== "Stage advanced to Moved In" && (
                    <span className="ml-1 text-muted-foreground">· {moveInAct.subject}</span>
                  )}
                </div>

                <button
                  onClick={() => { onViewLead(lead.id); onClose(); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium bg-success/10 text-success border border-success/25 hover:bg-success/20 transition-colors"
                >
                  <ExternalLink size={11} />
                  View Full Record
                </button>
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
