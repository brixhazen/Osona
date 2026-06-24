import { useState } from "react";
import { Copy, Check, Send, X, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Invoice, ResidentBilling } from "@/lib/mock/billing";

interface Props {
  invoice: Invoice;
  residents: ResidentBilling[];
  onClose: () => void;
}

function usd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(n);
}

function fmtDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

export function SendPaymentLinkModal({ invoice, residents, onClose }: Props) {
  const [copied, setCopied]   = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  const rp = residents.find((r) => r.id === invoice.residentId)?.responsibleParty;

  const paymentUrl = typeof window !== "undefined"
    ? `${window.location.origin}/pay/${invoice.id}`
    : `/pay/${invoice.id}`;

  const emailSubject = `Invoice ${invoice.invoiceNumber} — Haven Pines · ${usd(invoice.total)} due ${fmtDate(invoice.dueDate)}`;
  const emailBody = [
    `Dear ${rp?.name ?? "Resident Family"},`,
    ``,
    `An invoice has been prepared for ${invoice.residentName} at Haven Pines Senior Living.`,
    ``,
    `Invoice:    ${invoice.invoiceNumber}`,
    `Amount Due: ${usd(invoice.total)}`,
    `Due Date:   ${fmtDate(invoice.dueDate)}`,
    ``,
    `Pay securely online:`,
    paymentUrl,
    ``,
    `If you have questions, call us at (801) 555-0100.`,
    ``,
    `Thank you,`,
    `Haven Pines Senior Living — Billing Department`,
  ].join("\n");

  function handleCopy() {
    navigator.clipboard.writeText(paymentUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSendEmail() {
    if (sending || sent) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(onClose, 1400);
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-[520px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-base">Send Payment Link</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {invoice.invoiceNumber} · {invoice.residentName} · {usd(invoice.total)}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Payment link */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              <Link2 size={10} />
              Payment Link
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground truncate select-all">
                {paymentUrl}
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors shrink-0",
                  copied
                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "border-border hover:bg-muted",
                )}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </section>

          {/* Email preview */}
          <section className="flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Email Preview</div>
            <div className="rounded-lg border border-border overflow-hidden text-sm">
              <div className="bg-muted/30 border-b border-border px-3 py-2 flex flex-col gap-1">
                <div className="flex gap-2">
                  <span className="text-muted-foreground text-xs w-14 shrink-0">To:</span>
                  <span className="text-xs">{rp?.email ?? "No email on file"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground text-xs w-14 shrink-0">Subject:</span>
                  <span className="text-xs truncate">{emailSubject}</span>
                </div>
              </div>
              <pre className="px-3 py-3 text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans bg-background max-h-40 overflow-y-auto">
                {emailBody}
              </pre>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-muted/20">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm border border-border hover:bg-muted"
          >
            {sent ? "Done" : "Cancel"}
          </button>
          <button
            onClick={handleSendEmail}
            disabled={!rp?.email || sending || sent}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity",
              (!rp?.email || sending || sent) && "opacity-60 cursor-not-allowed",
            )}
            style={{ backgroundColor: sent ? "#16a34a" : "#34D399" }}
          >
            {sent ? (
              <><Check size={13} /> Sent to {rp?.email}</>
            ) : sending ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
            ) : (
              <><Send size={13} /> Send Email</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
