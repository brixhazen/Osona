import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis,
} from "recharts";
import {
  PAYER_MIX, BILLING_MONTH, type ResidentBilling,
} from "@/lib/mock/billing";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const PAYER_COLORS: Record<string, string> = {
  private_pay: "#2BBFAA",
  medicaid: "#F5A623",
  ltci: "#4DB896",
  va: "#7B9FD4",
  other: "#8A9BB0",
};

const PENDING_APPROVALS = {
  count: 8,
  total: 226,
  oldestDate: "June 15",
};

const UPCOMING_AUTOPAYS: { id: string; resident: string; amount: number; date: string; method: string }[] = [
  { id: "ap1", resident: "Margaret Chen",  amount: 4850, date: "Jun 20", method: "ACH" },
  { id: "ap2", resident: "Frank Delgado",  amount: 5120, date: "Jun 21", method: "Card •• 4471" },
  { id: "ap3", resident: "Helen Brooks",   amount: 6240, date: "Jun 22", method: "ACH" },
  { id: "ap4", resident: "Walter Pierce",  amount: 4625, date: "Jun 24", method: "ACH" },
  { id: "ap5", resident: "Joyce Hammond",  amount: 5380, date: "Jun 25", method: "Card •• 0982" },
  { id: "ap6", resident: "Arthur Quinn",   amount: 4970, date: "Jun 26", method: "ACH" },
];

const REVENUE_TREND: { month: string; revenue: number }[] = [
  { month: "Jan", revenue: 412 },
  { month: "Feb", revenue: 425 },
  { month: "Mar", revenue: 438 },
  { month: "Apr", revenue: 446 },
  { month: "May", revenue: 461 },
  { month: "Jun", revenue: 472 },
];

type Tab =
  | "overview" | "residents" | "rate-cards" | "approvals"
  | "statements" | "payments" | "ar" | "reports";

type ActionItem = {
  id: string;
  severity: "high" | "med";
  title: string;
  detail: string;
  tab: Tab;
};

export function BillingOverview({
  residents,
  onNavigate,
}: {
  residents: ResidentBilling[];
  onNavigate: (tab: Tab) => void;
}) {
  const items = buildActionItems(residents);

  return (
    <div className="grid grid-cols-[1fr_360px] gap-5">
      {/* Zone 2 — Action items */}
      <Section title="Action Items">
        {items.length === 0 && PENDING_APPROVALS.count === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            You're all caught up. Nothing needs attention right now.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <ActionRow key={item.id} item={item} onNavigate={onNavigate} />
            ))}
            {PENDING_APPROVALS.count > 0 && (
              <ActionRow
                item={{
                  id: "pending-approvals",
                  severity: "med",
                  title: `${PENDING_APPROVALS.count} incidental charges pending approval · ${usd2(PENDING_APPROVALS.total)}`,
                  detail: `Oldest charge logged ${PENDING_APPROVALS.oldestDate} · Tap to review`,
                  tab: "approvals",
                }}
                onNavigate={onNavigate}
              />
            )}
          </div>
        )}
      </Section>

      {/* Zone 3 — Payer mix */}
      <Section title={`Payer Mix — ${BILLING_MONTH}`}>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={PAYER_MIX}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="pct"
                    paddingAngle={2}
                  >
                    {PAYER_MIX.map((entry) => (
                      <Cell key={entry.key} fill={PAYER_COLORS[entry.key]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="w-full flex flex-col gap-1.5 mt-1">
                {PAYER_MIX.map((entry) => (
                  <div key={entry.key} className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PAYER_COLORS[entry.key] }}
                    />
                    <span className="text-xs text-foreground/80 flex-1">{entry.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{entry.pct}%</span>
                    <span className="text-xs font-mono">{usd(entry.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
      </Section>

      {/* Zone 4 — Upcoming autopays */}
      <Section title="Upcoming Autopays — Next 7 Days">
        <div className="flex flex-col">
          {UPCOMING_AUTOPAYS.map((a, i) => (
            <div
              key={a.id}
              className={cn(
                "flex items-center gap-3 py-2.5 text-sm",
                i !== UPCOMING_AUTOPAYS.length - 1 && "border-b border-border",
              )}
            >
              <div className="flex-1 font-medium text-foreground">{a.resident}</div>
              <div className="w-24 text-muted-foreground">{a.date}</div>
              <div className="w-36 text-xs text-muted-foreground">{a.method}</div>
              <div className="w-24 text-right font-mono font-semibold text-foreground">{usd2(a.amount)}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Zone 5 — Revenue trend */}
      <Section title="Revenue Trend — Last 6 Months">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={REVENUE_TREND} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickFormatter={(v) => `$${v}k`}
              width={42}
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.3 }}
              formatter={(value: number) => [`$${value}k`, "Revenue"]}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="revenue" fill="#83C0DF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
}

function ActionRow({ item, onNavigate }: { item: ActionItem; onNavigate: (tab: Tab) => void }) {
  return (
    <button
      onClick={() => onNavigate(item.tab)}
      className={cn(
        "flex gap-3 items-center text-left rounded-md border border-border border-l-[3px] bg-card px-3 py-3 hover:bg-secondary/30 transition-colors",
        item.severity === "high"
          ? "border-l-destructive"
          : "border-l-accent",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-foreground">{item.title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{item.detail}</div>
      </div>
      <ArrowRight size={14} className="text-muted-foreground shrink-0" />
    </button>
  );
}

function buildActionItems(residents: ResidentBilling[]): ActionItem[] {
  const items: ActionItem[] = [];

  // 1. Overdue accounts (A/R)
  for (const r of residents) {
    if (r.arBucket && r.arBucket !== "current" && r.currentBalance > 0) {
      const bucket =
        r.arBucket === "30_60" ? "30–60 days"
        : r.arBucket === "60_90" ? "60–90 days"
        : r.arBucket === "90_plus" ? "90+ days"
        : r.arBucket;
      items.push({
        id: `overdue-${r.id}`,
        severity: "high",
        title: `${r.name} — ${usd(r.currentBalance)} overdue`,
        detail: `Room ${r.room} · ${bucket} past due`,
        tab: "ar",
      });
    }
  }

  // 2. Failed autopay attempts — derived: autopay on but balance is past-due
  for (const r of residents) {
    if (r.responsibleParty?.autopay && r.arBucket && r.arBucket !== "current" && r.currentBalance > 0) {
      items.push({
        id: `autopay-${r.id}`,
        severity: "high",
        title: `Autopay failed — ${r.name}`,
        detail: `Room ${r.room} · last attempt did not clear (${usd(r.currentBalance)})`,
        tab: "payments",
      });
    }
  }

  // 3. Pending incidental charge approvals — none in demo data yet

  // 4. Statements not yet generated this month
  for (const r of residents) {
    if (r.statementStatus === "pending") {
      items.push({
        id: `stmt-${r.id}`,
        severity: "med",
        title: `Statement not generated — ${r.name}`,
        detail: `Room ${r.room} · awaiting this month's statement`,
        tab: "statements",
      });
    }
  }

  // 5. Residents missing a rate card
  for (const r of residents) {
    if (!r.rateHistory || r.rateHistory.length === 0) {
      items.push({
        id: `rate-${r.id}`,
        severity: "med",
        title: `Missing rate card — ${r.name}`,
        detail: `Room ${r.room} · no rate card on file`,
        tab: "rate-cards",
      });
    }
  }

  return items;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">{title}</div>
      {children}
    </div>
  );
}

function usd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function usd2(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}
