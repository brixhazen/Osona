import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSectionTab } from "@/lib/useSectionTab";
import { BillingOverview } from "./BillingOverview";
import { ResidentLedger } from "./ResidentLedger";
import { StatementsPanel } from "./StatementsPanel";
import { ArDashboard } from "./ArDashboard";
import { ReportsPanel } from "./ReportsPanel";
import { InvoicesPanel } from "./InvoicesPanel";
import { RateCardsPanel } from "./RateCardsPanel";
import { ApprovalsPanel } from "./ApprovalsPanel";
import {
  BILLING_ALERTS, BILLING_MONTH, MONTHLY_REVENUE_TOTAL, DSO_DAYS, CYCLE_STATS, RESIDENTS_BILLING, INVOICES,
  type ResidentBilling, type Payment, type AncillaryCharge, type RateRecord,
  type TrustTransaction, type StatementStatus, type CollectionStatus,
  type Invoice, type InvoiceStatus, type PaymentMethod,
} from "@/lib/mock/billing";
import { AlertTriangle, CreditCard } from "lucide-react";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { getNewResidents, syncInvoicesToStore, consumeCheckoutPayments } from "@/lib/billingStore";

const MODULE_COLOR = "#34D399";

type Tab = "overview" | "residents" | "rate-cards" | "approvals" | "statements" | "payments" | "ar" | "reports";

export function BillingModule() {
  const [tab, setTab] = useSectionTab<Tab>("overview");
  const [localResidents, setLocalResidents]   = useState<ResidentBilling[]>([...RESIDENTS_BILLING, ...getNewResidents()]);
  const [localCycleStats, setLocalCycleStats] = useState({ ...CYCLE_STATS });
  const [localInvoices, setLocalInvoices]     = useState<Invoice[]>([...INVOICES]);
  const [nextInvoiceNum, setNextInvoiceNum]   = useState(45);

  // Keep invoice store in sync so the checkout page always has current data
  useEffect(() => { syncInvoicesToStore(localInvoices); }, [localInvoices]);

  // Drain payments completed on the checkout page (same session, window focus)
  useEffect(() => {
    function drain() {
      const payments = consumeCheckoutPayments();
      for (const p of payments) markInvoicePaid(p.invoiceId, p.method as PaymentMethod);
    }
    drain();
    window.addEventListener("focus", drain);
    return () => window.removeEventListener("focus", drain);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const arOutstanding = localResidents.reduce((sum, r) => sum + r.currentBalance, 0);
  const pendingInvoiceCount = localInvoices.filter((i) => i.status === "draft" || i.status === "sent").length;
  const paidCount = localResidents.filter((r) => r.statementStatus === "paid").length;
  const unpaidPct = Math.round((localCycleStats.paid / localCycleStats.generated) * 100);
  const dangerAlerts = BILLING_ALERTS.filter((a) => a.type === "danger").length;
  const warnAlerts = BILLING_ALERTS.filter((a) => a.type === "warn").length;

  function recordPayment(residentId: string, payment: Payment) {
    const resident = localResidents.find((r) => r.id === residentId);
    if (!resident) return;
    const wasNotPaid = resident.statementStatus !== "paid";
    const willClear = payment.amount >= resident.currentBalance;

    setLocalResidents((prev) =>
      prev.map((r) => {
        if (r.id !== residentId) return r;
        const newBalance = Math.max(0, r.currentBalance - payment.amount);
        return {
          ...r,
          currentBalance: newBalance,
          arBucket: (newBalance === 0 ? "current" : r.arBucket) as ResidentBilling["arBucket"],
          collectionStatus: (newBalance === 0 ? "none" : r.collectionStatus) as ResidentBilling["collectionStatus"],
          statementStatus: (newBalance === 0 ? "paid" : r.statementStatus) as ResidentBilling["statementStatus"],
          lastPaymentDate: payment.date,
          lastPaymentAmount: payment.amount,
          paymentHistory: [payment, ...r.paymentHistory],
        };
      }),
    );

    if (wasNotPaid && willClear) {
      if (resident.statementStatus !== "sent") {
        setLocalCycleStats((cs) => ({ ...cs, sent: Math.min(cs.generated, cs.sent + 1) }));
      }
      setLocalCycleStats((cs) => ({ ...cs, paid: Math.min(cs.generated, cs.paid + 1) }));
    }
  }

  function addAncillaryCharge(residentId: string, charge: AncillaryCharge) {
    setLocalResidents((prev) =>
      prev.map((r) =>
        r.id === residentId ? { ...r, ancillaryCharges: [...r.ancillaryCharges, charge] } : r,
      ),
    );
  }

  function addRateChange(residentId: string, rate: RateRecord) {
    setLocalResidents((prev) =>
      prev.map((r) => {
        if (r.id !== residentId) return r;
        return {
          ...r,
          baseRate: rate.baseRate,
          locRate: rate.locRate,
          locTier: rate.locTier,
          monthlyTotal: rate.total,
          rateHistory: [rate, ...r.rateHistory],
        };
      }),
    );
  }

  function addTrustTransaction(residentId: string, tx: TrustTransaction) {
    setLocalResidents((prev) =>
      prev.map((r) => {
        if (r.id !== residentId) return r;
        const newBalance =
          tx.type === "deposit"
            ? (r.trustBalance ?? 0) + tx.amount
            : Math.max(0, (r.trustBalance ?? 0) - tx.amount);
        return {
          ...r,
          trustBalance: newBalance,
          trustTransactions: [{ ...tx, runningBalance: newBalance }, ...(r.trustTransactions ?? [])],
        };
      }),
    );
  }

  function updateStatementStatus(residentId: string, status: StatementStatus) {
    const resident = localResidents.find((r) => r.id === residentId);
    if (!resident) return;
    const prev = resident.statementStatus;

    setLocalResidents((rs) =>
      rs.map((r) => (r.id === residentId ? { ...r, statementStatus: status } : r)),
    );

    if (status === "sent" && prev !== "sent" && prev !== "paid") {
      setLocalCycleStats((cs) => ({ ...cs, sent: Math.min(cs.generated, cs.sent + 1) }));
    }
    if (status === "paid" && prev !== "paid") {
      if (prev !== "sent") {
        setLocalCycleStats((cs) => ({ ...cs, sent: Math.min(cs.generated, cs.sent + 1) }));
      }
      setLocalCycleStats((cs) => ({ ...cs, paid: Math.min(cs.generated, cs.paid + 1) }));
    }
  }

  function advanceCollectionStatus(residentId: string, status: CollectionStatus) {
    setLocalResidents((prev) =>
      prev.map((r) => (r.id === residentId ? { ...r, collectionStatus: status } : r)),
    );
  }

  function addInvoice(invoice: Invoice) {
    setLocalInvoices((prev) => [invoice, ...prev]);
    setNextInvoiceNum((n) => n + 1);
  }

  function updateInvoice(id: string, updates: Partial<Invoice>) {
    setLocalInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)));
  }

  function sendInvoice(id: string) {
    setLocalInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: "sent" as InvoiceStatus, paymentLinkSent: true, paymentLinkSentAt: new Date().toISOString() }
          : inv,
      ),
    );
  }

  function markInvoicePaid(id: string, method: PaymentMethod) {
    setLocalInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, status: "paid" as InvoiceStatus, paidAt: new Date().toISOString(), paidAmount: inv.total, paidMethod: method }
          : inv,
      ),
    );
  }

  function voidInvoice(id: string, reason: string) {
    setLocalInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "void" as InvoiceStatus, voidReason: reason } : inv)),
    );
  }

  function sendAllPending() {
    const genCount = localResidents.filter((r) => r.statementStatus === "generated").length;
    setLocalResidents((prev) =>
      prev.map((r) =>
        r.statementStatus === "generated" ? { ...r, statementStatus: "sent" as StatementStatus } : r,
      ),
    );
    if (genCount > 0) {
      setLocalCycleStats((cs) => ({ ...cs, sent: Math.min(cs.generated, cs.sent + genCount) }));
    }
  }

  return (
    <div className="flex flex-col gap-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      {tab === "overview" && (
        <>
          <ModuleHeader
            name="Billing & Finance"
            description="Revenue, invoicing, A/R, and payer reconciliation."
            icon={CreditCard}
            color={MODULE_COLOR}
          />

          <div className="grid grid-cols-4 gap-3">
            <TopKpi label="Monthly Revenue" value={usd(MONTHLY_REVENUE_TOTAL)} sub={`${BILLING_MONTH} · 87 residents`} tone="ok" />
            <TopKpi
              label="A/R Outstanding"
              value={usd(arOutstanding)}
              sub={`${localCycleStats.generated - localCycleStats.paid} invoices unpaid`}
              tone={arOutstanding > 30_000 ? "warn" : "ok"}
            />
            <TopKpi label="Days Sales Outstanding" value={`${DSO_DAYS} days`} sub="Healthy · target < 30 days" tone="ok" />
            <TopKpi
              label="Statements Collected"
              value={`${unpaidPct}%`}
              sub={`${localCycleStats.paid} of ${localCycleStats.generated} invoices`}
              tone={unpaidPct < 90 ? "warn" : "ok"}
            />
          </div>

          {(dangerAlerts > 0 || warnAlerts > 0) && (
            <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5">
              <AlertTriangle size={14} className="text-destructive shrink-0" />
              <span className="text-sm">
                {dangerAlerts > 0 && (
                  <span className="text-destructive font-medium">
                    {dangerAlerts} critical billing issue{dangerAlerts !== 1 ? "s" : ""}
                  </span>
                )}
                {dangerAlerts > 0 && warnAlerts > 0 && <span className="text-muted-foreground"> · </span>}
                {warnAlerts > 0 && (
                  <span className="text-accent font-medium">
                    {warnAlerts} item{warnAlerts !== 1 ? "s" : ""} need attention
                  </span>
                )}
                <span className="text-muted-foreground"> — review A/R and statements</span>
              </span>
              <button
                onClick={() => setTab("ar")}
                className="ml-auto text-xs text-destructive hover:text-destructive/80 font-medium"
              >
                View A/R →
              </button>
            </div>
          )}
        </>
      )}

      {tab === "overview" && <BillingOverview residents={localResidents} onNavigate={setTab} />}
      {tab === "residents" && (
        <ResidentLedger
          residents={localResidents}
          onRecordPayment={recordPayment}
          onAddAncillaryCharge={addAncillaryCharge}
          onAddRateChange={addRateChange}
          onAddTrustTransaction={addTrustTransaction}
          onUpdateStatementStatus={updateStatementStatus}
        />
      )}
      {tab === "rate-cards" && (
        <RateCardsPanel
          residents={localResidents}
          onRateCardSaved={(residentId, card) => {
            // Keep the legacy ResidentBilling snapshot in sync so other
            // billing screens (statements, A/R, ledger) reflect the change.
            setLocalResidents((prev) =>
              prev.map((r) =>
                r.id !== residentId
                  ? r
                  : {
                      ...r,
                      baseRate: card.baseRate,
                      locRate: card.locRate,
                      locTier: card.locTier === "none" ? "None" : `Level ${card.locTier.slice(-1)}`,
                      monthlyTotal: card.monthlyTotal,
                    },
              ),
            );
          }}
        />
      )}
      {tab === "approvals" && <ApprovalsPanel />}
      {tab === "statements" && (
        <div className="flex flex-col gap-5">
        <StatementsPanel
          residents={localResidents}
          cycleStats={localCycleStats}
          onUpdateStatementStatus={updateStatementStatus}
          onSendAllPending={sendAllPending}
        />
        <InvoicesPanel
          residents={localResidents}
          invoices={localInvoices}
          nextInvoiceNum={nextInvoiceNum}
          onAddInvoice={addInvoice}
          onUpdateInvoice={updateInvoice}
          onSendInvoice={sendInvoice}
          onMarkInvoicePaid={markInvoicePaid}
          onVoidInvoice={voidInvoice}
        />
        </div>
      )}
      {tab === "payments" && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="text-sm text-muted-foreground">No payments recorded yet.</div>
        </div>
      )}
      {tab === "ar" && (
        <ArDashboard
          residents={localResidents}
          onAdvanceCollectionStatus={advanceCollectionStatus}
          onRecordPayment={recordPayment}
        />
      )}
      {tab === "reports" && <ReportsPanel />}
    </div>
  );
}

function TopKpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "ok" | "warn" | "danger" }) {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4",
      tone === "danger" ? "border-destructive/30" : tone === "warn" ? "border-accent/30" : "border-border",
    )}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={cn(
        "font-mono text-2xl font-semibold tabular-nums",
        tone === "danger" ? "text-destructive" : tone === "warn" ? "text-accent" : "text-foreground",
      )}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
