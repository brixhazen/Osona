import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Send, Eye, Link2, X, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SendPaymentLinkModal } from "./SendPaymentLinkModal";
import type {
  Invoice, InvoiceStatus, InvoiceLineItem, PaymentMethod, ResidentBilling,
} from "@/lib/mock/billing";

interface Props {
  residents: ResidentBilling[];
  invoices: Invoice[];
  nextInvoiceNum: number;
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoice: (id: string, updates: Partial<Invoice>) => void;
  onSendInvoice: (id: string) => void;
  onMarkInvoicePaid: (id: string, method: PaymentMethod) => void;
  onVoidInvoice: (id: string, reason: string) => void;
}

type FilterStatus = "all" | InvoiceStatus;

const STATUS_CFG: Record<InvoiceStatus, { label: string; cls: string }> = {
  draft:  { label: "Draft",  cls: "bg-muted text-muted-foreground" },
  sent:   { label: "Sent",   cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  paid:   { label: "Paid",   cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  void:   { label: "Void",   cls: "bg-destructive/10 text-destructive" },
};

function usd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function plus30Str() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function emptyLine(): InvoiceLineItem {
  return { id: `li-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, description: "", qty: 1, unitPrice: 0, total: 0 };
}

export function InvoicesPanel({
  residents, invoices, nextInvoiceNum,
  onAddInvoice, onUpdateInvoice, onSendInvoice, onMarkInvoicePaid, onVoidInvoice,
}: Props) {
  const [filter, setFilter]             = useState<FilterStatus>("all");
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [editing, setEditing]           = useState<Invoice | null>(null);
  const [viewing, setViewing]           = useState<Invoice | null>(null);
  const [voidId, setVoidId]             = useState<string | null>(null);
  const [voidReason, setVoidReason]     = useState("");
  const [paidId, setPaidId]             = useState<string | null>(null);
  const [paidMethod, setPaidMethod]     = useState<PaymentMethod>("ach");
  const [linkInvoice, setLinkInvoice]   = useState<Invoice | null>(null);

  const filtered = filter === "all" ? invoices : invoices.filter((i) => i.status === filter);
  const counts: Record<FilterStatus, number> = {
    all:   invoices.length,
    draft: invoices.filter((i) => i.status === "draft").length,
    sent:  invoices.filter((i) => i.status === "sent").length,
    paid:  invoices.filter((i) => i.status === "paid").length,
    void:  invoices.filter((i) => i.status === "void").length,
  };

  const actionable = counts.draft + counts.sent;

  function openNew() { setEditing(null); setShowNewSheet(true); }
  function openEdit(inv: Invoice) { setEditing(inv); setShowNewSheet(true); }
  function closeSheet() { setShowNewSheet(false); setEditing(null); }

  function handleSave(invoice: Invoice) {
    if (editing) {
      onUpdateInvoice(editing.id, invoice);
    } else {
      onAddInvoice(invoice);
    }
    closeSheet();
    if (invoice.status === "sent") setLinkInvoice(invoice);
  }

  function handleVoidConfirm(id: string) {
    if (!voidReason.trim()) return;
    onVoidInvoice(id, voidReason.trim());
    setVoidId(null);
    setVoidReason("");
  }

  function handleMarkPaid(id: string) {
    onMarkInvoicePaid(id, paidMethod);
    setPaidId(null);
    setPaidMethod("ach");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Invoices</h2>
          <p className="text-sm text-muted-foreground">
            {counts.all} total · {counts.sent} awaiting payment · {counts.draft} draft
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white"
          style={{ backgroundColor: "#34D399" }}
        >
          <Plus size={14} />
          New Invoice
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1">
        {(["all", "draft", "sent", "paid", "void"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors",
              filter === s
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            {" "}
            <span className="opacity-60">{counts[s]}</span>
          </button>
        ))}
        {actionable > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {actionable} invoice{actionable !== 1 ? "s" : ""} need action
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[140px_1fr_72px_96px_96px_100px_72px_120px] gap-3 px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
          <div>Invoice #</div>
          <div>Resident</div>
          <div>Room</div>
          <div>Issued</div>
          <div>Due</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No {filter === "all" ? "" : filter + " "}invoices
          </div>
        )}

        {filtered.map((inv) => {
          const isVoidRow  = voidId  === inv.id;
          const isPaidRow  = paidId  === inv.id;
          const cfg        = STATUS_CFG[inv.status];

          return (
            <div key={inv.id} className={cn("border-b border-border last:border-0", inv.status === "void" && "opacity-50")}>
              {/* Main row */}
              <div className="grid grid-cols-[140px_1fr_72px_96px_96px_100px_72px_120px] gap-3 px-4 py-3 items-center text-sm">
                <div className="font-mono text-xs text-muted-foreground">{inv.invoiceNumber}</div>
                <div className="font-medium truncate">{inv.residentName}</div>
                <div className="font-mono text-xs text-muted-foreground">{inv.room}</div>
                <div className="text-xs text-muted-foreground">{fmtDate(inv.issueDate)}</div>
                <div className="text-xs text-muted-foreground">{fmtDate(inv.dueDate)}</div>
                <div className={cn("font-mono font-medium text-sm", inv.status === "void" && "line-through text-muted-foreground")}>
                  {usd(inv.total)}
                </div>
                <div>
                  <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", cfg.cls)}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewing(inv)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="View"
                  >
                    <Eye size={13} />
                  </button>
                  {inv.status === "draft" && (
                    <>
                      <button
                        onClick={() => openEdit(inv)}
                        className="text-xs px-1.5 py-0.5 rounded bg-muted hover:bg-muted/60 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { onSendInvoice(inv.id); setLinkInvoice(inv); }}
                        className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
                        style={{ backgroundColor: "#34D399" }}
                      >
                        Send
                      </button>
                    </>
                  )}
                  {inv.status === "sent" && (
                    <>
                      <button
                        onClick={() => setLinkInvoice(inv)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-blue-600"
                        title="Resend payment link"
                      >
                        <Link2 size={13} />
                      </button>
                      <button
                        onClick={() => { setPaidId(inv.id); setVoidId(null); }}
                        className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
                        style={{ backgroundColor: "#34D399" }}
                      >
                        Paid
                      </button>
                    </>
                  )}
                  {(inv.status === "draft" || inv.status === "sent") && (
                    <button
                      onClick={() => { setVoidId(inv.id); setPaidId(null); setVoidReason(""); }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                      title="Void invoice"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Payment link badge */}
              {inv.status === "sent" && inv.paymentLinkSent && (
                <div className="px-4 pb-2 -mt-1 flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400">
                  <Link2 size={9} />
                  Payment link sent{inv.paymentLinkSentAt ? ` · ${new Date(inv.paymentLinkSentAt).toLocaleDateString()}` : ""}
                </div>
              )}

              {/* Mark Paid inline */}
              {isPaidRow && (
                <div className="px-4 pb-3 pt-2 flex items-center gap-3 bg-green-50 dark:bg-green-950/20 border-t border-green-200 dark:border-green-900/30">
                  <Check size={13} className="text-green-600 shrink-0" />
                  <span className="text-xs font-medium">Payment method:</span>
                  <select
                    value={paidMethod}
                    onChange={(e) => setPaidMethod(e.target.value as PaymentMethod)}
                    className="text-xs border rounded px-2 py-1 bg-background"
                  >
                    <option value="ach">ACH</option>
                    <option value="check">Check</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="eft">EFT</option>
                  </select>
                  <button
                    onClick={() => handleMarkPaid(inv.id)}
                    className="text-xs px-2.5 py-1 rounded bg-green-600 text-white font-medium hover:bg-green-700"
                  >
                    Confirm Paid
                  </button>
                  <button onClick={() => setPaidId(null)} className="text-xs text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              )}

              {/* Void inline */}
              {isVoidRow && (
                <div className="px-4 pb-3 pt-2 flex items-center gap-3 bg-destructive/5 border-t border-destructive/20">
                  <span className="text-xs font-medium text-destructive shrink-0">Void reason:</span>
                  <input
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    placeholder="Enter reason…"
                    className="flex-1 text-xs border rounded px-2 py-1 bg-background"
                    autoFocus
                  />
                  <button
                    onClick={() => handleVoidConfirm(inv.id)}
                    disabled={!voidReason.trim()}
                    className="text-xs px-2.5 py-1 rounded bg-destructive text-white font-medium hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Void
                  </button>
                  <button onClick={() => setVoidId(null)} className="text-xs text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              )}

              {/* Void reason display */}
              {inv.status === "void" && inv.voidReason && (
                <div className="px-4 pb-2 -mt-1 text-[10px] text-muted-foreground">
                  Void reason: {inv.voidReason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New / Edit Sheet */}
      <Sheet open={showNewSheet} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent side="right" className="w-[600px] sm:max-w-[600px] overflow-y-auto flex flex-col">
          <InvoiceForm
            residents={residents}
            editing={editing}
            nextInvoiceNum={nextInvoiceNum}
            onSave={handleSave}
            onClose={closeSheet}
          />
        </SheetContent>
      </Sheet>

      {/* View Detail Sheet */}
      <Sheet open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null); }}>
        <SheetContent side="right" className="w-[520px] sm:max-w-[520px] overflow-y-auto">
          {viewing && <InvoiceDetail invoice={viewing} />}
        </SheetContent>
      </Sheet>

      {/* Send Payment Link Modal */}
      {linkInvoice && (
        <SendPaymentLinkModal
          invoice={linkInvoice}
          residents={residents}
          onClose={() => setLinkInvoice(null)}
        />
      )}
    </div>
  );
}

// ── Invoice Form ──────────────────────────────────────────────────────────────

interface FormProps {
  residents: ResidentBilling[];
  editing: Invoice | null;
  nextInvoiceNum: number;
  onSave: (invoice: Invoice) => void;
  onClose: () => void;
}

function InvoiceForm({ residents, editing, nextInvoiceNum, onSave, onClose }: FormProps) {
  const invoiceNumber = editing?.invoiceNumber ?? `INV-2026-${String(nextInvoiceNum).padStart(3, "0")}`;

  const [residentId, setResidentId] = useState(editing?.residentId ?? "");
  const [issueDate, setIssueDate]   = useState(editing?.issueDate  ?? todayStr());
  const [dueDate, setDueDate]       = useState(editing?.dueDate    ?? plus30Str());
  const [lineItems, setLineItems]   = useState<InvoiceLineItem[]>(
    editing?.lineItems?.length ? editing.lineItems : [emptyLine()],
  );
  const [notes, setNotes] = useState(editing?.notes ?? "");

  const selectedResident = residents.find((r) => r.id === residentId);
  const subtotal = lineItems.reduce((sum, li) => sum + li.qty * li.unitPrice, 0);
  const canSave  = !!residentId && lineItems.some((li) => li.description.trim() && li.unitPrice !== 0);

  function updateLine(id: string, field: keyof InvoiceLineItem, raw: string) {
    setLineItems((prev) =>
      prev.map((li) => {
        if (li.id !== id) return li;
        const val = field === "description" ? raw : parseFloat(raw) || 0;
        const updated = { ...li, [field]: val } as InvoiceLineItem;
        updated.total = updated.qty * updated.unitPrice;
        return updated;
      }),
    );
  }

  function build(send: boolean): Invoice {
    return {
      id:              editing?.id ?? `inv-${Date.now()}`,
      invoiceNumber,
      residentId,
      residentName:    selectedResident?.name ?? "",
      room:            selectedResident?.room ?? "",
      issueDate,
      dueDate,
      status:          send ? "sent" : "draft",
      lineItems,
      subtotal,
      total:           subtotal,
      notes:           notes.trim() || undefined,
      paymentLinkSent: send,
      paymentLinkSentAt: send ? new Date().toISOString() : undefined,
    };
  }

  return (
    <>
      <SheetHeader className="pb-4 border-b border-border shrink-0">
        <SheetTitle>{editing ? "Edit Invoice" : "New Invoice"}</SheetTitle>
        <SheetDescription className="font-mono text-xs">{invoiceNumber}</SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-5 flex flex-col gap-6">
        {/* Resident & Dates */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resident & Dates</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Resident</label>
            <select
              value={residentId}
              onChange={(e) => setResidentId(e.target.value)}
              className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background"
            >
              <option value="">Select resident…</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>{r.name} — {r.room}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background"
              />
            </div>
          </div>
        </section>

        {/* Line Items */}
        <section className="flex flex-col gap-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Line Items</h3>
          <div className="grid grid-cols-[1fr_52px_96px_80px_28px] gap-2 text-[10px] uppercase tracking-wider text-muted-foreground px-1">
            <div>Description</div>
            <div>Qty</div>
            <div>Unit Price</div>
            <div className="text-right">Total</div>
            <div />
          </div>
          {lineItems.map((li) => (
            <div key={li.id} className="grid grid-cols-[1fr_52px_96px_80px_28px] gap-2 items-center">
              <input
                type="text"
                value={li.description}
                onChange={(e) => updateLine(li.id, "description", e.target.value)}
                placeholder="Description"
                className="text-sm border border-border rounded px-2 py-1.5 bg-background"
              />
              <input
                type="number"
                value={li.qty}
                onChange={(e) => updateLine(li.id, "qty", e.target.value)}
                min="0.5"
                step="0.5"
                className="text-sm border border-border rounded px-2 py-1.5 bg-background text-center"
              />
              <input
                type="number"
                value={li.unitPrice || ""}
                onChange={(e) => updateLine(li.id, "unitPrice", e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="text-sm border border-border rounded px-2 py-1.5 bg-background"
              />
              <div className={cn(
                "text-sm font-mono text-right pr-1",
                li.total < 0 ? "text-green-600 dark:text-green-400" : "text-foreground",
              )}>
                {li.unitPrice !== 0 ? usd(li.total) : "—"}
              </div>
              <button
                onClick={() => setLineItems((p) => p.filter((x) => x.id !== li.id))}
                disabled={lineItems.length === 1}
                className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setLineItems((p) => [...p, emptyLine()])}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground w-fit mt-1"
          >
            <Plus size={12} />
            Add Line Item
          </button>
        </section>

        {/* Notes */}
        <section className="flex flex-col gap-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for this invoice…"
            rows={3}
            className="text-sm border border-border rounded-md px-3 py-2 bg-background resize-none"
          />
        </section>

        {/* Total preview */}
        <div className="rounded-lg bg-muted/40 border border-border p-4 flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">{usd(subtotal)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t border-border pt-2 mt-0.5">
            <span>Total</span>
            <span className="font-mono">{usd(subtotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md text-sm border border-border hover:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(build(false))}
          disabled={!canSave}
          className="px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save as Draft
        </button>
        <button
          onClick={() => onSave(build(true))}
          disabled={!canSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#34D399" }}
        >
          <Send size={13} />
          Save & Send
        </button>
      </div>
    </>
  );
}

// ── Invoice Detail (read-only view) ──────────────────────────────────────────

function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const cfg = STATUS_CFG[invoice.status];

  return (
    <>
      <SheetHeader className="pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div>
            <SheetTitle>{invoice.invoiceNumber}</SheetTitle>
            <SheetDescription>{invoice.residentName} · {invoice.room}</SheetDescription>
          </div>
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium shrink-0 mt-1", cfg.cls)}>
            {cfg.label}
          </span>
        </div>
      </SheetHeader>

      <div className="py-5 flex flex-col gap-5">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Issue Date</div>
            <div>{fmtDate(invoice.issueDate)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Due Date</div>
            <div>{fmtDate(invoice.dueDate)}</div>
          </div>
        </div>

        {/* Line items */}
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Line Items</h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-[1fr_44px_84px_84px] gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-b border-border">
              <div>Description</div>
              <div>Qty</div>
              <div>Unit Price</div>
              <div className="text-right">Total</div>
            </div>
            {invoice.lineItems.map((li) => (
              <div
                key={li.id}
                className="grid grid-cols-[1fr_44px_84px_84px] gap-2 px-3 py-2.5 text-sm border-b border-border last:border-0"
              >
                <div>{li.description}</div>
                <div className="text-muted-foreground">{li.qty}</div>
                <div className="font-mono text-muted-foreground">{usd(li.unitPrice)}</div>
                <div className={cn(
                  "font-mono text-right",
                  li.total < 0 ? "text-green-600 dark:text-green-400" : "",
                )}>
                  {usd(li.total)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Total */}
        <div className="rounded-lg bg-muted/40 border border-border p-4 flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">{usd(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t border-border pt-2 mt-0.5">
            <span>Total</span>
            <span className={cn("font-mono", invoice.status === "void" && "line-through text-muted-foreground")}>
              {usd(invoice.total)}
            </span>
          </div>
        </div>

        {/* Payment info */}
        {invoice.status === "paid" && invoice.paidAt && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-4">
            <div className="text-[10px] uppercase tracking-wider text-green-600 dark:text-green-400 font-semibold mb-2">
              Payment Received
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Date</div>
                <div>{new Date(invoice.paidAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Amount</div>
                <div className="font-mono">{usd(invoice.paidAmount ?? invoice.total)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground mb-0.5">Method</div>
                <div className="uppercase text-xs">{(invoice.paidMethod ?? "—").replace("_", " ")}</div>
              </div>
            </div>
          </div>
        )}

        {/* Void reason */}
        {invoice.status === "void" && invoice.voidReason && (
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
            <div className="text-[10px] uppercase tracking-wider text-destructive font-semibold mb-1">Void Reason</div>
            <p className="text-sm">{invoice.voidReason}</p>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        )}

        {/* Payment link badge */}
        {invoice.paymentLinkSent && invoice.paymentLinkSentAt && (
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
            <Link2 size={12} />
            Payment link sent · {new Date(invoice.paymentLinkSentAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </>
  );
}
