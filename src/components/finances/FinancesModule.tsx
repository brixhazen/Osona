import { useState } from "react";
import {
  Landmark, CheckCircle2, RefreshCw, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Receipt, AlertTriangle, ChevronDown, Download,
} from "lucide-react";
import {
  PL_ITEMS, MONTHLY_TREND, DEPT_EXPENSES, AR_AGING, RECENT_TRANSACTIONS,
  FINANCES_MONTH, CASH_ON_HAND, QB_LAST_SYNCED,
  type PLLineItem, type Transaction,
} from "@/lib/mock/finances";
import { cn } from "@/lib/utils";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

const MODULE_COLOR = "#10B981";

type Tab = "overview" | "expenses" | "aging" | "transactions";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "P&L Overview" },
  { id: "expenses", label: "Dept. Expenses" },
  { id: "aging", label: "A/R Aging" },
  { id: "transactions", label: "Transactions" },
];

function relativeTime(isoStr: string): string {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const days = Math.floor(diff / 86400);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function usd(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function usdK(n: number): string {
  if (Math.abs(n) >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return usd(n);
}

export function FinancesModule() {
  const [tab, setTab] = useState<Tab>("overview");

  const revTotal = PL_ITEMS.find((i) => i.id === "rev_total")!;
  const expTotal = PL_ITEMS.find((i) => i.id === "exp_total")!;
  const netIncome = PL_ITEMS.find((i) => i.id === "net_income")!;
  const arTotal = AR_AGING.reduce((s, b) => s + b.amount, 0);
  const arOverdue = AR_AGING.filter((b) => b.range !== "Current").reduce((s, b) => s + b.amount, 0);
  const margin = Math.round((netIncome.currentMonth / revTotal.currentMonth) * 100);
  const revDelta = revTotal.currentMonth - revTotal.priorMonth;
  const netDelta = netIncome.currentMonth - netIncome.priorMonth;

  return (
    <div className="space-y-5 -m-6 p-6 min-h-full" style={{ backgroundColor: `${MODULE_COLOR}08` }}>
      {/* Header + QuickBooks banner */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <ModuleHeader
          name="Finances"
          description="QuickBooks-connected P&L, expense tracking, and accounts receivable."
          icon={Landmark}
          color={MODULE_COLOR}
        />
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-success/25 bg-success/5 mt-1 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          <div>
            <div className="text-xs font-semibold text-success">Connected to QuickBooks Online</div>
            <div className="text-[11px] text-muted-foreground">Last synced {relativeTime(QB_LAST_SYNCED)}</div>
          </div>
          <button className="ml-1 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors border border-border rounded px-2 py-1">
            <RefreshCw size={10} />
            Sync
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Revenue (MTD)"
          value={usdK(revTotal.currentMonth)}
          sub={`${revDelta >= 0 ? "+" : ""}${usdK(revDelta)} vs last month`}
          trend={revDelta >= 0 ? "up" : "down"}
        />
        <KpiCard
          label="Expenses (MTD)"
          value={usdK(expTotal.currentMonth)}
          sub={`Budget ${usdK(expTotal.budget!)}`}
          alert={expTotal.currentMonth > expTotal.budget!}
        />
        <KpiCard
          label="Net Income"
          value={usdK(netIncome.currentMonth)}
          sub={`${margin}% margin · ${netDelta >= 0 ? "+" : ""}${usdK(netDelta)} vs prior`}
          trend={netDelta >= 0 ? "up" : "down"}
          prominent
        />
        <KpiCard
          label="Cash on Hand"
          value={usdK(CASH_ON_HAND)}
          sub="Checking + money market"
        />
        <KpiCard
          label="A/R Outstanding"
          value={usdK(arTotal)}
          sub={`${usdK(arOverdue)} overdue >30 days`}
          alert={arOverdue > 40000}
        />
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id ? "" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            style={tab === t.id ? { borderColor: MODULE_COLOR, color: MODULE_COLOR } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "expenses" && <ExpensesTab />}
      {tab === "aging" && <AgingTab />}
      {tab === "transactions" && <TransactionsTab />}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, trend, alert, prominent,
}: {
  label: string;
  value: string;
  sub: string;
  trend?: "up" | "down";
  alert?: boolean;
  prominent?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-lg bg-card border border-border p-4",
      prominent && "border-[#10B981]/30 bg-[#10B981]/5",
    )}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
        {trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-success" />}
        {trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
        {alert && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
      </div>
      <div className={cn(
        "font-mono text-2xl font-bold leading-none",
        prominent ? "text-[#10B981]" : alert ? "text-warning" : "",
      )}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{sub}</div>
    </div>
  );
}

// ── Overview Tab (P&L table + trend) ─────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
      <div className="xl:col-span-3">
        <PLTable />
      </div>
      <div className="xl:col-span-2">
        <TrendChart />
      </div>
    </div>
  );
}

function PLTable() {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleSection(headerId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(headerId)) next.delete(headerId); else next.add(headerId);
      return next;
    });
  }

  let currentSection = "";
  const visibleItems = PL_ITEMS.filter((item) => {
    if (item.isSectionHeader) { currentSection = item.id; return true; }
    if (item.indent && collapsed.has(currentSection)) return false;
    return true;
  });

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
        <h3 className="font-semibold text-sm">Profit & Loss — {FINANCES_MONTH}</h3>
        <span className="text-[11px] text-muted-foreground">via QuickBooks</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="text-left px-4 py-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider w-full">Category</th>
              <th className="text-right px-3 py-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap">Current Mo.</th>
              <th className="text-right px-3 py-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap">vs Prior</th>
              <th className="text-right px-3 py-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap">YTD</th>
              <th className="text-right px-4 py-2 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider whitespace-nowrap">Variance</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <PLRow
                key={item.id}
                item={item}
                isCollapsed={item.isSectionHeader ? collapsed.has(item.id) : undefined}
                onToggleSection={item.isSectionHeader ? () => toggleSection(item.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PLRow({ item, isCollapsed, onToggleSection }: {
  item: PLLineItem;
  isCollapsed?: boolean;
  onToggleSection?: () => void;
}) {
  if (item.isSectionHeader) {
    return (
      <tr
        className="bg-muted/30 border-t border-border cursor-pointer hover:bg-muted/40 transition-colors select-none"
        onClick={onToggleSection}
      >
        <td colSpan={5} className="px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{item.label}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", isCollapsed && "-rotate-90")} />
          </div>
        </td>
      </tr>
    );
  }

  const isRevenue = item.id.startsWith("rev_") && !item.isSubtotal;
  const isNetIncome = item.id === "net_income";
  const delta = item.currentMonth - item.priorMonth;
  const deltaSign = delta >= 0 ? "+" : "";

  // Budget variance: positive = good, negative = bad
  // For revenue: over budget is good. For expenses: over budget is bad.
  const isExpense = item.id.startsWith("exp_") || item.id.startsWith("labor_") || item.id.startsWith("ops_");
  const variance = item.budget != null ? item.currentMonth - item.budget : null;
  const varianceGood = variance != null
    ? (isExpense ? variance <= 0 : variance >= 0)
    : null;

  if (item.isTotal) {
    return (
      <tr className={cn(
        "border-t-2 border-border",
        isNetIncome ? "bg-[#10B981]/5" : "bg-muted/20",
      )}>
        <td className={cn("px-4 py-3 font-bold text-sm", isNetIncome && "text-[#10B981]")}>
          {item.label}
        </td>
        <td className={cn("px-3 py-3 text-right font-mono font-bold text-sm", isNetIncome && "text-[#10B981]")}>
          {usd(item.currentMonth)}
        </td>
        <td className={cn("px-3 py-3 text-right font-mono text-xs", delta >= 0 ? "text-success" : "text-destructive")}>
          {deltaSign}{usd(delta)}
        </td>
        <td className="px-3 py-3 text-right font-mono font-bold text-sm">
          {usd(item.ytd)}
        </td>
        <td className={cn("px-4 py-3 text-right font-mono text-xs font-semibold", varianceGood === true ? "text-success" : varianceGood === false ? "text-destructive" : "")}>
          {variance != null ? `${variance >= 0 ? "+" : ""}${usd(variance)}` : "—"}
        </td>
      </tr>
    );
  }

  if (item.isSubtotal) {
    return (
      <tr className="border-t border-border bg-surface/40">
        <td className={cn("py-2 font-semibold", item.indent ? "pl-8 pr-3" : "px-4")}>
          {item.label}
        </td>
        <td className="px-3 py-2 text-right font-mono font-semibold">{usd(item.currentMonth)}</td>
        <td className={cn("px-3 py-2 text-right font-mono text-[11px]", delta >= 0 ? "text-success" : "text-destructive")}>
          {deltaSign}{usd(delta)}
        </td>
        <td className="px-3 py-2 text-right font-mono font-semibold">{usd(item.ytd)}</td>
        <td className={cn("px-4 py-2 text-right font-mono text-[11px] font-medium", varianceGood === true ? "text-success" : varianceGood === false ? "text-destructive" : "")}>
          {variance != null ? `${variance >= 0 ? "+" : ""}${usd(variance)}` : "—"}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border/40 hover:bg-surface/30 transition-colors">
      <td className={cn("py-2 text-muted-foreground", item.indent ? "pl-8 pr-3" : "px-4")}>
        {item.label}
      </td>
      <td className={cn("px-3 py-2 text-right font-mono", isRevenue && "text-success font-medium")}>
        {usd(item.currentMonth)}
      </td>
      <td className={cn("px-3 py-2 text-right font-mono text-[11px]", delta >= 0 ? "text-success" : "text-destructive")}>
        {delta !== 0 ? `${deltaSign}${usd(delta)}` : "—"}
      </td>
      <td className="px-3 py-2 text-right font-mono text-muted-foreground">{usd(item.ytd)}</td>
      <td className={cn("px-4 py-2 text-right font-mono text-[11px]", varianceGood === true ? "text-success" : varianceGood === false ? "text-destructive" : "text-muted-foreground")}>
        {variance != null ? `${variance >= 0 ? "+" : ""}${usd(variance)}` : "—"}
      </td>
    </tr>
  );
}

function TrendChart() {
  const maxRevenue = Math.max(...MONTHLY_TREND.map((m) => m.revenue));

  return (
    <div className="rounded-lg border border-border bg-card p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-sm">6-Month Trend</h3>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]/70 inline-block" />Revenue</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-destructive/40 inline-block" />Expenses</span>
        </div>
      </div>

      <div className="flex items-end gap-2 h-40">
        {MONTHLY_TREND.map((m, i) => {
          const revH = Math.round((m.revenue / maxRevenue) * 100);
          const expH = Math.round((m.expenses / maxRevenue) * 100);
          const isCurrent = i === MONTHLY_TREND.length - 1;
          return (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5 h-32">
                <div
                  className={cn("flex-1 rounded-t-sm transition-all", isCurrent ? "bg-[#10B981]" : "bg-[#10B981]/50")}
                  style={{ height: `${revH}%` }}
                />
                <div
                  className={cn("flex-1 rounded-t-sm transition-all", isCurrent ? "bg-destructive/60" : "bg-destructive/30")}
                  style={{ height: `${expH}%` }}
                />
              </div>
              <div className={cn("text-[10px] font-mono", isCurrent ? "text-foreground font-semibold" : "text-muted-foreground")}>
                {m.month}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-2">
        {MONTHLY_TREND.slice(-3).reverse().map((m, i) => (
          <div key={m.month} className="flex items-center justify-between text-[11px]">
            <span className={cn("text-muted-foreground", i === 0 && "font-semibold text-foreground")}>{m.month} {FINANCES_MONTH.split(" ")[1]}</span>
            <span className={cn("font-mono", m.net >= 0 ? "text-success" : "text-destructive")}>
              {m.net >= 0 ? "+" : ""}{usdK(m.net)} net
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Expenses Tab ──────────────────────────────────────────────────────────────

function ExpensesTab() {
  const totalActual = DEPT_EXPENSES.reduce((s, d) => s + d.actual, 0);
  const totalBudget = DEPT_EXPENSES.reduce((s, d) => s + d.budget, 0);
  const totalOver = totalActual - totalBudget;
  const maxActual = Math.max(...DEPT_EXPENSES.map((d) => Math.max(d.actual, d.budget)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Spent</div>
          <div className="font-mono font-bold text-xl">{usdK(totalActual)}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Budget</div>
          <div className="font-mono font-bold text-xl">{usdK(totalBudget)}</div>
        </div>
        <div className={cn("rounded-lg border p-4", totalOver > 0 ? "border-destructive/20 bg-destructive/5" : "border-success/20 bg-success/5")}>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Budget Variance</div>
          <div className={cn("font-mono font-bold text-xl", totalOver > 0 ? "text-destructive" : "text-success")}>
            {totalOver >= 0 ? "+" : ""}{usdK(totalOver)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface">
          <h3 className="font-semibold text-sm">Department Budget vs. Actual — {FINANCES_MONTH}</h3>
        </div>
        <div className="divide-y divide-border">
          {DEPT_EXPENSES.map((d) => {
            const pct = Math.round((d.actual / d.budget) * 100);
            const over = d.actual > d.budget;
            const variance = d.actual - d.budget;
            const barWidth = Math.min((d.actual / maxActual) * 100, 100);
            const budgetMark = Math.min((d.budget / maxActual) * 100, 100);

            return (
              <div key={d.dept} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{d.dept}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">Budget: <span className="font-mono">{usd(d.budget)}</span></span>
                    <span className={cn("font-mono font-semibold", over ? "text-destructive" : "text-success")}>
                      {over ? <ArrowUpRight className="w-3.5 h-3.5 inline" /> : <ArrowDownRight className="w-3.5 h-3.5 inline" />}
                      {variance >= 0 ? "+" : ""}{usd(variance)} ({pct}%)
                    </span>
                  </div>
                </div>
                <div className="relative h-5 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", over ? "bg-destructive/60" : "bg-[#10B981]/60")}
                    style={{ width: `${barWidth}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground/30"
                    style={{ left: `${budgetMark}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>Actual: <span className="font-mono">{usd(d.actual)}</span></span>
                  <span>Budget line</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── A/R Aging Tab ─────────────────────────────────────────────────────────────

function AgingTab() {
  const total = AR_AGING.reduce((s, b) => s + b.amount, 0);

  const BUCKET_STYLES = [
    "border-success/25 bg-success/5 text-success",
    "border-warning/25 bg-warning/5 text-warning",
    "border-accent/25 bg-accent/5 text-accent",
    "border-destructive/25 bg-destructive/5 text-destructive",
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {AR_AGING.map((b, i) => {
          const pct = Math.round((b.amount / total) * 100);
          return (
            <div key={b.range} className={cn("rounded-lg border p-4", BUCKET_STYLES[i])}>
              <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">{b.range}</div>
              <div className="font-mono font-bold text-xl">{usdK(b.amount)}</div>
              <div className="text-[11px] mt-1 opacity-80">{b.count} accounts · {pct}% of total</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
          <h3 className="font-semibold text-sm">Aging Breakdown</h3>
          <span className="text-[11px] text-muted-foreground">Total outstanding: <span className="font-mono font-semibold">{usd(total)}</span></span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-surface/60">
              <th className="text-left px-4 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Bucket</th>
              <th className="text-center px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Accounts</th>
              <th className="text-right px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Amount</th>
              <th className="text-right px-4 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">% of Total</th>
              <th className="px-4 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Distribution</th>
            </tr>
          </thead>
          <tbody>
            {AR_AGING.map((b, i) => {
              const pct = (b.amount / total) * 100;
              const BAR_COLORS = ["bg-success", "bg-warning", "bg-accent", "bg-destructive"];
              return (
                <tr key={b.range} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3 font-medium">{b.range}<span className="ml-2 text-[11px] text-muted-foreground font-normal">{b.days}</span></td>
                  <td className="px-3 py-3 text-center font-mono">{b.count}</td>
                  <td className="px-3 py-3 text-right font-mono font-semibold">{usd(b.amount)}</td>
                  <td className="px-4 py-3 text-right font-mono">{pct.toFixed(1)}%</td>
                  <td className="px-4 py-3">
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden w-full">
                      <div className={cn("h-full rounded-full", BAR_COLORS[i])} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-border bg-surface/30">
              <td className="px-4 py-3 font-bold">Total</td>
              <td className="px-3 py-3 text-center font-mono font-semibold">{AR_AGING.reduce((s, b) => s + b.count, 0)}</td>
              <td className="px-3 py-3 text-right font-mono font-bold">{usd(total)}</td>
              <td className="px-4 py-3 text-right font-mono font-semibold">100%</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-warning mb-1">Collection Follow-Up Needed</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono font-medium">{usd(AR_AGING.slice(1).reduce((s, b) => s + b.amount, 0))}</span> across{" "}
              {AR_AGING.slice(1).reduce((s, b) => s + b.count, 0)} accounts is past 30 days.
              Review in the Billing module to send statements or initiate collection outreach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Transactions Tab ──────────────────────────────────────────────────────────

function downloadCSV(transactions: Transaction[]) {
  const rows = [
    ["Date", "Description", "Payee", "Account", "Type", "Amount"].join(","),
    ...transactions.map((t) =>
      [t.date, `"${t.description}"`, `"${t.payee}"`, `"${t.account}"`, t.type, t.type === "income" ? t.amount : -t.amount].join(",")
    ),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function TransactionsTab() {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const filtered = RECENT_TRANSACTIONS.filter((t) => filter === "all" || t.type === filter);

  const totalIn = RECENT_TRANSACTIONS.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalOut = RECENT_TRANSACTIONS.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize",
                filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All Transactions" : f === "income" ? "Income" : "Expenses"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <button
            onClick={() => downloadCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download size={11} />
            Export CSV
          </button>
          <span className="text-muted-foreground">Recent transactions</span>
          <span className="text-success font-mono font-medium">+{usd(totalIn)} in</span>
          <span className="text-destructive font-mono font-medium">−{usd(totalOut)} out</span>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Date</th>
              <th className="text-left px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Description</th>
              <th className="text-left px-3 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider hidden md:table-cell">Account</th>
              <th className="text-right px-4 py-2.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <TransactionRow key={t.id} txn={t} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No transactions match this filter.</div>
        )}
      </div>
    </div>
  );
}

function TransactionRow({ txn }: { txn: Transaction }) {
  return (
    <tr className="border-b border-border/40 last:border-0 hover:bg-surface/30 transition-colors">
      <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">{txn.date}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
            txn.type === "income" ? "bg-success/15" : "bg-destructive/10",
          )}>
            <Receipt className={cn("w-2.5 h-2.5", txn.type === "income" ? "text-success" : "text-destructive")} />
          </div>
          <div>
            <div className="font-medium leading-snug">{txn.description}</div>
            <div className="text-[11px] text-muted-foreground">{txn.payee}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{txn.account}</td>
      <td className={cn(
        "px-4 py-3 text-right font-mono font-semibold whitespace-nowrap",
        txn.type === "income" ? "text-success" : "text-destructive",
      )}>
        {txn.type === "income" ? "+" : "−"}{usd(txn.amount)}
      </td>
    </tr>
  );
}
