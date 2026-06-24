import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getStoredInvoice, queueCheckoutPayment } from "@/lib/billingStore";
import { CheckCircle, Lock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/lib/mock/billing";

export const Route = createFileRoute("/pay/$invoiceId")({
  head: () => ({ meta: [{ title: "Secure Payment — Haven OS" }] }),
  component: CheckoutPage,
});

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

function formatCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})(?=.)/g, "$1 ");
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

// ── Route shell ──────────────────────────────────────────────────────────────

function CheckoutPage() {
  const { invoiceId } = Route.useParams();
  const invoice = getStoredInvoice(invoiceId);

  if (!invoice || invoice.status === "void") return <InvalidPage />;
  if (invoice.status === "paid") return <AlreadyPaidPage invoice={invoice} />;
  return <PaymentForm invoice={invoice} />;
}

// ── Shared chrome ────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#0a1520] flex flex-col">
      <header className="bg-white dark:bg-[#111c2b] border-b border-border px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ backgroundColor: "#34D399" }}
          >
            <span className="text-white font-bold text-xs leading-none">H</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Haven OS</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock size={11} />
          Secure Payment
        </div>
      </header>
      <main className="flex-1 flex items-start justify-center p-6 pt-10">
        {children}
      </main>
    </div>
  );
}

// ── Payment form ──────────────────────────────────────────────────────────────

function PaymentForm({ invoice }: { invoice: Invoice }) {
  const [name, setName]       = useState("");
  const [card, setCard]       = useState("");
  const [expiry, setExpiry]   = useState("");
  const [cvc, setCvc]         = useState("");
  const [paying, setPaying]   = useState(false);
  const [paid, setPaid]       = useState(false);

  const digits = card.replace(/\s/g, "");
  const canPay = name.trim().length > 0 && digits.length === 16 && expiry.length >= 4 && cvc.length >= 3;

  function handlePay() {
    if (!canPay || paying) return;
    setPaying(true);
    setTimeout(() => {
      queueCheckoutPayment(invoice.id, "credit_card");
      setPaying(false);
      setPaid(true);
    }, 2000);
  }

  if (paid) return <SuccessPage invoice={invoice} />;

  return (
    <PageShell>
      <div className="w-full max-w-[460px] flex flex-col gap-4">
        {/* Invoice summary */}
        <div className="bg-white dark:bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Invoice</div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-lg">{invoice.invoiceNumber}</span>
              <span className="text-muted-foreground text-sm">· {invoice.residentName} · {invoice.room}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Due {fmtDate(invoice.dueDate)}</div>
          </div>

          <div className="border-t border-border pt-3 flex flex-col gap-1.5">
            {invoice.lineItems.map((li) => (
              <div key={li.id} className="flex justify-between text-sm gap-3">
                <span className="text-muted-foreground truncate">{li.description}</span>
                <span className={cn("font-mono shrink-0", li.total < 0 && "text-green-600 dark:text-green-400")}>
                  {usd(li.total)}
                </span>
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t border-border pt-2 mt-1">
              <span>Total Due</span>
              <span className="font-mono text-base">{usd(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Card form */}
        <div className="bg-white dark:bg-card rounded-xl border border-border shadow-sm p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-sm">Card Details</h2>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Name on Card</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-[#34D399]/40 focus:border-[#34D399]"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={card}
                  onChange={(e) => setCard(formatCard(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  className="w-full text-sm border border-border rounded-lg px-3 py-2.5 pr-10 bg-background font-mono focus:outline-none focus:ring-2 focus:ring-[#34D399]/40 focus:border-[#34D399]"
                />
                <CreditCard size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Expiry</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background font-mono focus:outline-none focus:ring-2 focus:ring-[#34D399]/40 focus:border-[#34D399]"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">CVC</label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  inputMode="numeric"
                  className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background font-mono focus:outline-none focus:ring-2 focus:ring-[#34D399]/40 focus:border-[#34D399]"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={!canPay || paying}
            className={cn(
              "w-full py-3 rounded-lg text-sm font-semibold text-white transition-opacity",
              (!canPay || paying) && "opacity-50 cursor-not-allowed",
            )}
            style={{ backgroundColor: "#34D399" }}
          >
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Processing…
              </span>
            ) : (
              `Pay ${usd(invoice.total)}`
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock size={10} />
            Payments powered by Haven OS · 256-bit SSL encryption
          </div>
        </div>

        {/* Contact footer */}
        <div className="text-center text-xs text-muted-foreground pb-6 flex flex-col gap-0.5">
          <span className="font-medium text-foreground">Haven Pines Senior Living</span>
          <span>(801) 555-0100 · billing@havenpines.com</span>
        </div>
      </div>
    </PageShell>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────

function SuccessPage({ invoice }: { invoice: Invoice }) {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <PageShell>
      <div className="w-full max-w-[420px]">
        <div className="bg-white dark:bg-card rounded-xl border border-border shadow-sm p-8 flex flex-col items-center gap-5 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
          </div>

          <div>
            <h1 className="font-semibold text-xl">Payment Successful</h1>
            <p className="text-muted-foreground text-sm mt-1">{usd(invoice.total)} received</p>
          </div>

          <div className="w-full bg-muted/40 rounded-lg p-4 text-sm text-left flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invoice</span>
              <span className="font-mono">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Resident</span>
              <span>{invoice.residentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{today}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-border pt-2 mt-0.5">
              <span>Amount Paid</span>
              <span className="font-mono text-green-600 dark:text-green-400">{usd(invoice.total)}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            A receipt has been sent to the responsible party on file.
          </p>

          <a
            href="/billing"
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white text-center block"
            style={{ backgroundColor: "#34D399" }}
          >
            Return to Haven OS
          </a>
        </div>
      </div>
    </PageShell>
  );
}

// ── Error screens ─────────────────────────────────────────────────────────────

function InvalidPage() {
  return (
    <PageShell>
      <div className="text-center max-w-sm py-10">
        <h1 className="font-semibold text-lg">Payment Link Not Found</h1>
        <p className="text-muted-foreground text-sm mt-2">
          This payment link is invalid or has expired. Please contact Haven Pines for assistance.
        </p>
        <p className="text-sm mt-4 font-medium">(801) 555-0100</p>
      </div>
    </PageShell>
  );
}

function AlreadyPaidPage({ invoice }: { invoice: Invoice }) {
  return (
    <PageShell>
      <div className="w-full max-w-[420px]">
        <div className="bg-white dark:bg-card rounded-xl border border-border shadow-sm p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="font-semibold text-xl">Already Paid</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {invoice.invoiceNumber} · {invoice.residentName}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            This invoice has already been paid. No further action is needed.
          </p>
          <a href="/billing" className="text-sm font-medium" style={{ color: "#34D399" }}>
            ← Return to Haven OS
          </a>
        </div>
      </div>
    </PageShell>
  );
}
