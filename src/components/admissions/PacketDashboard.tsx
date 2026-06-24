import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, Clock, Send, FileText, X, ChevronRight,
  AlertTriangle, RotateCcw, Download, Bell, User, Calendar,
  Mail, MapPin, Pen, ArrowRight, Plus,
} from "lucide-react";
import {
  ADMISSION_PACKETS, DOCUMENT_TEMPLATES, PACKET_TEMPLATES, ADMIT_PROSPECTS,
  type AdmissionPacket, type PacketStatus, type DocumentInstance, type CareType,
} from "@/lib/mock/admissions";
import { SignatureCanvas } from "./SignatureCanvas";

const MODULE_COLOR = "#10B981";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<PacketStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  draft:       { label: "Draft",       bg: "bg-muted/60",          text: "text-muted-foreground", icon: <FileText   size={11} /> },
  sent:        { label: "Sent",        bg: "bg-blue-500/12",       text: "text-blue-500",         icon: <Send       size={11} /> },
  in_progress: { label: "In Progress", bg: "bg-amber-500/12",      text: "text-amber-500",        icon: <Clock      size={11} /> },
  complete:    { label: "Complete",    bg: "bg-emerald-500/12",    text: "text-emerald-600",      icon: <CheckCircle2 size={11} /> },
  expired:     { label: "Expired",     bg: "bg-destructive/10",    text: "text-destructive",      icon: <AlertTriangle size={11} /> },
};

const CARE_LABELS: Record<CareType, string> = {
  independent: "Independent",
  assisted:    "Assisted Living",
  memory_care: "Memory Care",
  respite:     "Respite",
};

const AUDIT_ICONS: Record<string, React.ReactNode> = {
  created:       <Plus size={12} />,
  sent:          <Send size={12} />,
  opened:        <Mail size={12} />,
  doc_signed:    <Pen  size={12} />,
  completed:     <CheckCircle2 size={12} />,
  reminder_sent: <Bell size={12} />,
  expired:       <AlertTriangle size={12} />,
  viewed:        <FileText size={12} />,
};

function StatusBadge({ status }: { status: PacketStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full", cfg.bg, cfg.text)}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function progress(packet: AdmissionPacket) {
  const total  = packet.documents.length;
  const signed = packet.documents.filter((d) => d.status === "signed").length;
  return { total, signed, pct: total ? Math.round((signed / total) * 100) : 0 };
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ── Main component ────────────────────────────────────────────────────────────

export function PacketDashboard() {
  const [packets,         setPackets]         = useState<AdmissionPacket[]>(ADMISSION_PACKETS);
  const [filter,          setFilter]          = useState<PacketStatus | "all">("all");
  const [selectedId,      setSelectedId]      = useState<string | null>(null);
  const [signingDocId,    setSigningDocId]     = useState<string | null>(null);
  const [justSigned,      setJustSigned]       = useState<string | null>(null);
  const [newOpen,         setNewOpen]          = useState(false);
  const [newStep,         setNewStep]          = useState<1 | 2>(1);
  const [newProspect,     setNewProspect]      = useState<typeof ADMIT_PROSPECTS[0] | null>(null);
  const [newTemplate,     setNewTemplate]      = useState<string | null>(null);
  const [newEmail,        setNewEmail]         = useState("");
  const [newRoom,         setNewRoom]          = useState("");
  const [newMoveIn,       setNewMoveIn]        = useState("");
  const [sendSuccess,     setSendSuccess]      = useState(false);

  const selectedPacket = packets.find((p) => p.id === selectedId) ?? null;
  const signingDoc     = signingDocId
    ? selectedPacket?.documents.find((d) => d.id === signingDocId) ?? null
    : null;
  const signingTemplate = signingDoc
    ? DOCUMENT_TEMPLATES.find((dt) => dt.id === signingDoc.templateId) ?? null
    : null;

  const FILTER_TABS: { id: PacketStatus | "all"; label: string }[] = [
    { id: "all",         label: `All (${packets.length})` },
    { id: "in_progress", label: `In Progress (${packets.filter((p) => p.status === "in_progress").length})` },
    { id: "sent",        label: `Sent (${packets.filter((p) => p.status === "sent").length})` },
    { id: "draft",       label: `Draft (${packets.filter((p) => p.status === "draft").length})` },
    { id: "complete",    label: `Complete (${packets.filter((p) => p.status === "complete").length})` },
    { id: "expired",     label: `Expired (${packets.filter((p) => p.status === "expired").length})` },
  ];

  const visible = filter === "all" ? packets : packets.filter((p) => p.status === filter);

  // ── Signing ──────────────────────────────────────────────────────────────

  function handleSign(dataUrl: string) {
    if (!selectedId || !signingDocId) return;
    const now = new Date().toISOString();

    setPackets((prev) => prev.map((pkt) => {
      if (pkt.id !== selectedId) return pkt;

      const updatedDocs = pkt.documents.map((d) =>
        d.id === signingDocId
          ? { ...d, status: "signed" as const, signedAt: now, signerName: pkt.signerName ?? "Signer", signatureDataUrl: dataUrl }
          : d,
      );

      const allSigned = updatedDocs.every((d) => d.status === "signed");
      const newStatus: PacketStatus = allSigned ? "complete" : "in_progress";

      const newEvents = [
        {
          id: `ev-${Date.now()}`,
          type: "doc_signed" as const,
          actor: pkt.signerName ?? "Signer",
          timestamp: now,
          detail: `Signed: ${DOCUMENT_TEMPLATES.find((dt) => dt.id === signingDocId)?.name ?? "Document"}`,
        },
        ...(allSigned ? [{
          id: `ev-${Date.now() + 1}`,
          type: "completed" as const,
          actor: "System",
          timestamp: now,
          detail: `All ${updatedDocs.length} documents signed — packet complete`,
        }] : []),
      ];

      return { ...pkt, documents: updatedDocs, status: newStatus, auditLog: [...pkt.auditLog, ...newEvents], ...(allSigned ? { completedAt: now } : {}) };
    }));

    setJustSigned(signingDocId);
    setSigningDocId(null);
    setTimeout(() => setJustSigned(null), 2500);
  }

  // ── Send new admission ────────────────────────────────────────────────────

  function handleSend() {
    if (!newProspect || !newTemplate) return;
    const tmpl   = PACKET_TEMPLATES.find((pt) => pt.id === newTemplate)!;
    const now    = new Date().toISOString();
    const newPkt: AdmissionPacket = {
      id:                 `ap-${Date.now()}`,
      residentName:       newProspect.name,
      residentDob:        newProspect.dob,
      careType:           newProspect.careType,
      unit:               newRoom || "TBD",
      moveInDate:         newMoveIn || "TBD",
      packetTemplateId:   tmpl.id,
      packetTemplateName: tmpl.name,
      status:             "sent",
      sentTo:             newEmail,
      signerName:         newProspect.name,
      sentAt:             now,
      signingToken:       `tok_new_${Date.now()}`,
      documents:          tmpl.documentIds.map((tid) => ({
        id: `di-${tid}-${Date.now()}`,
        templateId: tid,
        status: "pending" as const,
      })),
      auditLog: [
        { id: `ev-${Date.now()}`,     type: "created", actor: "Dana Alvarez", timestamp: now, detail: `Packet created from ${tmpl.name} template` },
        { id: `ev-${Date.now() + 1}`, type: "sent",    actor: "Dana Alvarez", timestamp: now, detail: `Signing link sent to ${newEmail}` },
      ],
    };
    setPackets((prev) => [newPkt, ...prev]);
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setNewOpen(false);
      setNewStep(1);
      setNewProspect(null);
      setNewTemplate(null);
      setNewEmail("");
      setNewRoom("");
      setNewMoveIn("");
      setSelectedId(newPkt.id);
    }, 1800);
  }

  return (
    <div className={cn("flex gap-5 transition-all", selectedPacket ? "items-start" : "")}>
      {/* ── Packet table ────────────────────────────────────────────────────── */}
      <div className={cn("flex-1 min-w-0 space-y-3 transition-all", selectedPacket && "max-w-[520px]")}>
        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 bg-muted/20 rounded-lg p-0.5 flex-wrap">
            {FILTER_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  filter === t.id
                    ? "bg-card text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <button
              onClick={() => { setNewOpen(true); setNewStep(1); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: MODULE_COLOR }}
            >
              <Plus size={14} />
              New Admission
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/60">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Resident</th>
                {!selectedPacket && <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Packet</th>}
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                {!selectedPacket && <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Progress</th>}
                {!selectedPacket && <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Move-in</th>}
              </tr>
            </thead>
            <tbody>
              {visible.map((pkt) => {
                const prog     = progress(pkt);
                const selected = selectedId === pkt.id;
                return (
                  <tr
                    key={pkt.id}
                    onClick={() => setSelectedId(selected ? null : pkt.id)}
                    className={cn(
                      "border-b border-border/40 last:border-0 cursor-pointer transition-colors",
                      selected ? "bg-[#10B981]/6" : "hover:bg-muted/20",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium leading-snug">{pkt.residentName}</div>
                      <div className="text-[11px] text-muted-foreground">{CARE_LABELS[pkt.careType]}</div>
                    </td>
                    {!selectedPacket && (
                      <td className="px-3 py-3 text-muted-foreground text-xs hidden md:table-cell">{pkt.packetTemplateName}</td>
                    )}
                    <td className="px-3 py-3">
                      <StatusBadge status={pkt.status} />
                    </td>
                    {!selectedPacket && (
                      <td className="px-3 py-3 hidden lg:table-cell">
                        {pkt.status !== "draft" && (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${prog.pct}%`, backgroundColor: MODULE_COLOR }}
                              />
                            </div>
                            <span className="text-[11px] text-muted-foreground">{prog.signed}/{prog.total}</span>
                          </div>
                        )}
                      </td>
                    )}
                    {!selectedPacket && (
                      <td className="px-3 py-3 text-[11px] text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                        {fmtDate(pkt.moveInDate)}
                      </td>
                    )}
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No packets in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail panel ────────────────────────────────────────────────────── */}
      {selectedPacket && (
        <div className="w-[480px] shrink-0 bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-base">{selectedPacket.residentName}</span>
                <StatusBadge status={selectedPacket.status} />
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin size={10} />{selectedPacket.unit} · {CARE_LABELS[selectedPacket.careType]}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Calendar size={10} />Move-in {fmtDate(selectedPacket.moveInDate)}
                </span>
              </div>
              {selectedPacket.sentTo && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <Mail size={10} />{selectedPacket.signerName} · {selectedPacket.sentTo}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {(selectedPacket.status === "sent" || selectedPacket.status === "in_progress") && (
                <button className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors">
                  <Bell size={11} />Send Reminder
                </button>
              )}
              {selectedPacket.status === "complete" && (
                <button className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors">
                  <Download size={11} />Download All
                </button>
              )}
              {selectedPacket.status === "expired" && (
                <button className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/5 transition-colors">
                  <RotateCcw size={11} />Resend
                </button>
              )}
              <button
                onClick={() => setSelectedId(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {selectedPacket.status !== "draft" && (
            <div className="px-5 py-3 border-b border-border bg-surface/40">
              {(() => {
                const prog = progress(selectedPacket);
                return (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${prog.pct}%`, backgroundColor: MODULE_COLOR }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                      {prog.signed} / {prog.total} signed
                    </span>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="overflow-y-auto max-h-[480px]">
            {/* Documents */}
            <div className="px-5 py-4 space-y-2">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Documents</div>
              {selectedPacket.documents.map((doc) => {
                const tmpl     = DOCUMENT_TEMPLATES.find((dt) => dt.id === doc.templateId);
                const isSigned = doc.status === "signed";
                const flash    = justSigned === doc.id;
                const canSign  = !isSigned && (
                  selectedPacket.status === "in_progress" ||
                  selectedPacket.status === "sent" ||
                  selectedPacket.status === "draft"
                );

                return (
                  <div
                    key={doc.id}
                    className={cn(
                      "flex items-start gap-3 px-3 py-3 rounded-lg border transition-all duration-500",
                      flash          ? "bg-emerald-500/10 border-emerald-500/30" :
                      isSigned       ? "bg-muted/20 border-border/50" :
                                       "bg-background border-border hover:border-border/80",
                    )}
                  >
                    <div className={cn(
                      "size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      isSigned ? "bg-emerald-500/15" : "bg-muted",
                    )}>
                      {isSigned
                        ? <CheckCircle2 size={14} className="text-emerald-600" />
                        : <FileText     size={14} className="text-muted-foreground" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{tmpl?.name}</div>
                      {isSigned ? (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Signed by {doc.signerName} · {fmtDateTime(doc.signedAt!)}
                        </div>
                      ) : (
                        <div className="text-[11px] text-muted-foreground mt-0.5">Awaiting signature</div>
                      )}
                      {/* Signature preview */}
                      {isSigned && doc.signatureDataUrl && (
                        <div className="mt-2 rounded-md border border-border/50 bg-white px-2 py-1 inline-block">
                          <img
                            src={doc.signatureDataUrl}
                            alt="Signature"
                            className="h-8 object-contain"
                          />
                        </div>
                      )}
                    </div>
                    {canSign && (
                      <button
                        onClick={() => setSigningDocId(doc.id)}
                        className="shrink-0 flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-[#10B981]/40 hover:text-[#10B981] transition-colors"
                      >
                        <Pen size={10} />Sign
                      </button>
                    )}
                    {isSigned && (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-1" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Audit log */}
            <div className="px-5 pb-5 space-y-1">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3 mt-1">Activity</div>
              <div className="relative pl-5">
                {/* Timeline line */}
                <div className="absolute left-2 top-0 bottom-0 w-px bg-border/60" />
                {[...selectedPacket.auditLog].reverse().map((ev) => (
                  <div key={ev.id} className="relative mb-4 last:mb-0">
                    <div
                      className="absolute -left-3 top-0.5 size-5 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: ev.type === "completed" ? MODULE_COLOR : ev.type === "expired" ? "#ef4444" : "#94a3b8" }}
                    >
                      {AUDIT_ICONS[ev.type]}
                    </div>
                    <div className="pl-3">
                      <div className="text-xs text-foreground/90">{ev.detail}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{ev.actor} · {fmtDateTime(ev.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Signing modal ────────────────────────────────────────────────────── */}
      {signingDoc && signingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <div
                className="size-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: MODULE_COLOR + "18" }}
              >
                <Pen size={16} style={{ color: MODULE_COLOR }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{signingTemplate.name}</div>
                <div className="text-[11px] text-muted-foreground">{signingTemplate.pageCount} pages · {signingTemplate.category}</div>
              </div>
              <button
                onClick={() => setSigningDocId(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Document preview mockup */}
            <div className="mx-6 mt-5 rounded-lg border border-border bg-white p-5 space-y-2.5">
              <div className="h-2 bg-muted rounded w-3/4" />
              <div className="h-2 bg-muted/60 rounded w-full" />
              <div className="h-2 bg-muted/60 rounded w-5/6" />
              <div className="h-2 bg-muted/60 rounded w-full" />
              <div className="h-2 bg-muted/60 rounded w-2/3" />
              <div className="h-px bg-border my-2" />
              <div className="h-2 bg-muted/60 rounded w-full" />
              <div className="h-2 bg-muted/60 rounded w-4/5" />
              <div className="h-2 bg-muted/60 rounded w-full" />
              <div className="h-2 bg-muted/60 rounded w-3/4" />
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
                <div className="text-[10px] text-muted-foreground">Signing as:</div>
                <div className="text-[11px] font-medium">{selectedPacket?.signerName ?? "Signer"}</div>
              </div>
            </div>

            {/* Signature canvas */}
            <div className="px-6 py-5">
              <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <User size={11} />
                Signature of {selectedPacket?.signerName ?? "Signer"}
              </div>
              <SignatureCanvas
                onSign={handleSign}
                onCancel={() => setSigningDocId(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── New Admission modal ──────────────────────────────────────────────── */}
      {newOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-semibold">New Admission Packet</div>
                <div className="text-[11px] text-muted-foreground">Step {newStep} of 2</div>
              </div>
              <button
                onClick={() => { setNewOpen(false); setNewStep(1); setNewProspect(null); setNewTemplate(null); }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {sendSuccess ? (
              <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
                <div className="size-14 rounded-full flex items-center justify-center" style={{ backgroundColor: MODULE_COLOR + "20" }}>
                  <CheckCircle2 size={28} style={{ color: MODULE_COLOR }} />
                </div>
                <div className="font-semibold text-base">Packet sent!</div>
                <div className="text-sm text-muted-foreground">
                  Signing link delivered to {newEmail}
                </div>
              </div>
            ) : newStep === 1 ? (
              /* Step 1 — Resident */
              <div className="px-6 py-5 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select Resident</div>
                  <div className="space-y-2">
                    {ADMIT_PROSPECTS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => setNewProspect(p)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors",
                          newProspect?.name === p.name
                            ? "border-[#10B981]/40 bg-[#10B981]/6"
                            : "border-border hover:bg-muted/10",
                        )}
                      >
                        <div
                          className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: MODULE_COLOR }}
                        >
                          {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground">{CARE_LABELS[p.careType]}</div>
                        </div>
                        {newProspect?.name === p.name && (
                          <CheckCircle2 size={16} className="ml-auto" style={{ color: MODULE_COLOR }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Unit / Room</label>
                    <input value={newRoom} onChange={(e) => setNewRoom(e.target.value)} placeholder="e.g. AL-19"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#10B981]/40" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Move-in Date</label>
                    <input type="date" value={newMoveIn} onChange={(e) => setNewMoveIn(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#10B981]/40" />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setNewStep(2)}
                    disabled={!newProspect}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: MODULE_COLOR }}
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2 — Template + Send */
              <div className="px-6 py-5 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Select Packet Template</div>
                  <div className="space-y-2">
                    {PACKET_TEMPLATES.map((pt) => (
                      <button
                        key={pt.id}
                        onClick={() => setNewTemplate(pt.id)}
                        className={cn(
                          "w-full flex items-start gap-3 px-3 py-3 rounded-lg border text-left transition-colors",
                          newTemplate === pt.id
                            ? "border-[#10B981]/40 bg-[#10B981]/6"
                            : "border-border hover:bg-muted/10",
                        )}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">{pt.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{pt.description}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">{pt.documentIds.length} documents</div>
                        </div>
                        {newTemplate === pt.id && (
                          <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: MODULE_COLOR }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Send signing link to</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="family@email.com"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#10B981]/40"
                  />
                </div>
                <div className="flex items-center gap-2 justify-between pt-1">
                  <button onClick={() => setNewStep(1)} className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors">
                    Back
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!newTemplate || !newEmail}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: MODULE_COLOR }}
                  >
                    <Send size={13} />Send Packet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
